import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { ConfigService } from "@nestjs/config"
import * as path from "path"
import { In, Repository } from "typeorm"
import * as uuid from "uuid"
import { Queue } from "bull"
import { InjectQueue } from "@nestjs/bull"
import {
  DeleteS3ObjectsJob,
  MediaMetadata,
  MediaMetadataWithIds,
  Metadata,
  UpdateMetadataJob,
} from "@root/shared/interface/file"
import { Env } from "@root/shared/enum/env"
import { User } from "@root/shared/interface/user"
import { FileObject } from "../entities/file-object.entity"
import { isArrayOf, isInstanceOf } from "@root/shared/helper/array.helper"
import { UserDoesNotHavPermission } from "@root/shared/exception/user.exception"
import { DELETE_S3_OBJECTS, FILE_QUEUE, UPDATE_MEDIA_METADATA } from "@root/shared/constant/queue"
import { FileUrlReq } from "../dto/file-object.dto"
import { SERVICE_NAME } from "@root/shared/constant/static-config"
import {
  CopyObjectCommand,
  CopyObjectRequest,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { AwsHelper } from "@root/shared/helper/aws.helper"
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { UserHelper } from "@root/shared/helper/user.helper"

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name)
  private readonly ONE_HOUR = 60 * 60
  private readonly invalidationRef: string
  private readonly s3Client: S3Client
  private readonly cloudFrontClient: CloudFrontClient

  constructor(
    @InjectQueue(FILE_QUEUE) private fileQueue: Queue,
    @InjectRepository(FileObject) private fileObjectRepository: Repository<FileObject>,
    private config: ConfigService,
  ) {
    this.s3Client = new S3Client(AwsHelper.config)
    this.cloudFrontClient = new CloudFrontClient(AwsHelper.config)
    this.invalidationRef = `${SERVICE_NAME}-${this.config.get<string>(Env.STAGE)}`
  }

  async getPreSignedUrls(dto: FileUrlReq, user: User) {
    const ids: string[] = new Array(dto.count).fill(0).map(() => uuid.v4())
    const bucketName = this.config.get<string>(Env.MEDIA_BUCKET_NAME)
    await this.createFileObjects(ids, dto, bucketName, user.id)
    const results = await Promise.allSettled(
      ids.map(async (id) => {
        const key = this.getS3Key(dto.directory, id)
        const preSignedMeta = { file_object_id: id, user_id: user.id }
        return { id, url: await this.getPreSignedUrl(key, bucketName, preSignedMeta) }
      }),
    )
    return results.map((res) => (res.status == "fulfilled" ? res.value : null)).filter((res) => !!res)
  }

  async updateMediaMetadataWithUser(user?: User, mediaMetadata?: MediaMetadataWithIds) {
    if (!mediaMetadata || !mediaMetadata.ids.length || !user) {
      return {}
    }
    await this.checkFilesOwnerByIds(mediaMetadata.ids, user)
    mediaMetadata.user_id = user.id
    return this.updateMediaMetadata(mediaMetadata)
  }

  async deleteS3Object(key: string, bucketName?: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucketName ? bucketName : this.config.get<string>(Env.MEDIA_BUCKET_NAME),
      Key: key,
    })
    await this.s3Client.send(command)
  }

  async findOne(id?: string) {
    return await this.fileObjectRepository.findOneOrFail({ where: { id } })
  }

  async findOneOrNull(id?: string) {
    return await this.fileObjectRepository.findOne({ where: { id } })
  }

  async findMany(ids?: string[]) {
    return await this.fileObjectRepository.find({ where: { id: In(ids) } })
  }

  async save(fileObject: FileObject) {
    return await this.fileObjectRepository.save(fileObject)
  }

  async create(fileObject: FileObject) {
    return this.save(fileObject)
  }

  async update(fileObject: FileObject) {
    return this.save(fileObject)
  }

  async delete(id: string) {
    const current = await this.findOne(id)
    const deleted = await this.fileObjectRepository.delete({ id: current.id })
    await this.deleteS3Object(this.getS3KeyFromFile(current), current.bucketName)
    return deleted
  }

  async deleteFiles(files: string[] | FileObject[]) {
    const targetFiles = await this.getFilesFromArray(files)
    await this.addFileToDeleteQueue(targetFiles.map((file) => this.getS3KeyFromFile(file)))
    return await this.fileObjectRepository.remove(targetFiles)
  }

  getS3KeyFromFile(file: FileObject) {
    return this.getS3Key(file.directory, file.id)
  }

  getS3Key(directory: string, id: string) {
    return path.join(directory, id)
  }

  async deleteS3Objects(keys: string[], bucketName: string) {
    if (keys.length) {
      const command = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: { Objects: keys.map((key) => ({ Key: key })) },
      })
      const res = await this.s3Client.send(command)
      const deletedKeys = res?.Deleted?.map((deleted) => deleted.Key).filter((key) => key)
      if (bucketName != this.config.get<string>(Env.MEDIA_SOURCE_BUCKET_NAME)) {
        await this.invalidateCaches(deletedKeys)
      }
    }
  }

  async invalidateCaches(uploadKeys: string[]) {
    const targetItems = uploadKeys.map((key) => (key && key.startsWith("/") ? key : `/${key}`))
    const command = new CreateInvalidationCommand({
      DistributionId: this.config.get<string>(Env.MEDIA_DISTRIBUTION_ID),
      InvalidationBatch: {
        CallerReference: `${this.invalidationRef}-${new Date().getTime()}`,
        Paths: {
          Quantity: targetItems ? targetItems.length : 0,
          Items: targetItems,
        },
      },
    })
    await this.cloudFrontClient.send(command)
  }

  async deleteUserFile(id: string, user: User) {
    return await this.deleteUserFiles([id], user)
  }

  async deleteUserFiles(ids: string[], user?: User) {
    const files = await this.fileObjectRepository.findBy({ id: In(ids) })
    this.checkFilesOwner(files, user)
    const deleted = await this.deleteFiles(files)
    return { deleted: deleted.length }
  }

  async putS3Metadata(bucket: string, key: string, metaData: Metadata) {
    const prevMeta = await this.getS3ObjectHead(key, bucket)
    const meta = { ...prevMeta.Metadata, ...metaData }
    await this.copyS3FileObject({
      CopySource: `${bucket}/${key}`,
      Bucket: bucket,
      Key: key,
      ContentType: prevMeta.ContentType,
      Metadata: meta,
      MetadataDirective: "REPLACE",
    })
  }

  async updateMediaMetadata(mediaMetadata: MediaMetadataWithIds) {
    const ids = mediaMetadata.ids
    const metadata: Metadata = this.getS3MetadataFromMediaMetadata(mediaMetadata)
    await this.fileQueue.add(UPDATE_MEDIA_METADATA, <UpdateMetadataJob>{
      ids: ids,
      metadata: this.getS3MetadataFromMediaMetadata(mediaMetadata),
    })
    return { ids: ids, metadata: metadata }
  }

  getS3MetadataFromMediaMetadata(mediaMetadata: MediaMetadata) {
    return { ...mediaMetadata, ids: undefined }
  }

  async updateMultipleMediaMetadata(ids: string[], metadata: Metadata) {
    const files = await this.fileObjectRepository.find({
      where: { id: In(ids) },
    })
    for (const file of files) {
      const bucket = this.getBucketNameFromFile(file)
      const key = this.getS3KeyFromFile(file)
      try {
        await this.putS3Metadata(bucket, key, metadata)
      } catch (e) {
        this.logger.log(`metadata update failed: ${key}`)
      }
    }
  }

  private async addFileToDeleteQueue(targetS3Keys: string[], bucketName?: string) {
    await this.fileQueue.add(DELETE_S3_OBJECTS, <DeleteS3ObjectsJob>{
      keys: targetS3Keys.filter((key) => key),
      bucketName: this.getBucketName(bucketName),
    })
  }

  private async createFileObjects(ids: string[], dto: FileUrlReq, bucketName: string, userId: string) {
    const fileObjects = ids.map(
      (id) =>
        <FileObject>{
          id,
          userId: userId,
          directory: dto.directory,
          bucketName: bucketName,
        },
    )
    return await this.fileObjectRepository.save(fileObjects)
  }

  private async getPreSignedUrl(key: string, bucket: string, metaData?: Metadata) {
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, Metadata: metaData })
    return await getSignedUrl(this.s3Client, command, { expiresIn: this.ONE_HOUR })
  }

  private async getFilesFromArray(files: string[] | FileObject[]) {
    const isFileObjectArray = isArrayOf(isInstanceOf(FileObject))
    return isFileObjectArray(files) ? files : await this.fileObjectRepository.findBy({ id: In(files) })
  }

  private checkFilesOwner(files: FileObject[], user?: User) {
    if (UserHelper.isAdmin(user)) {
      return true
    }
    if (!user || files.some((file) => !file.userId || file.userId != user?.id)) {
      throw new UserDoesNotHavPermission()
    }
  }

  private async checkFilesOwnerByIds(ids: string[], user: User) {
    const files = await this.fileObjectRepository.find({
      where: { id: In(ids) },
    })
    this.checkFilesOwner(files, user)
  }

  private getBucketNameFromFile(file: FileObject) {
    return this.getBucketName(file.bucketName)
  }

  private getBucketName(bucketName?: string) {
    return bucketName ? bucketName : this.config.get<string>(Env.MEDIA_BUCKET_NAME)
  }

  private async getS3Object(key: string, bucket?: string) {
    const command = new GetObjectCommand({ Bucket: this.getBucketName(bucket), Key: key })
    return await this.s3Client.send(command)
  }

  private async getS3ObjectHead(key: string, bucket?: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.getBucketName(bucket),
        Key: key,
      })
      return await this.s3Client.send(command)
    } catch (error) {
      const errorMessage = error.statusCode === 404 ? `S3 object not found: ${key}` : error.message
      throw new NotFoundException(errorMessage)
    }
  }

  private async copyS3FileObject(copyObjectRequest: CopyObjectRequest) {
    const command = new CopyObjectCommand(copyObjectRequest)
    return await this.s3Client.send(command)
  }
}
