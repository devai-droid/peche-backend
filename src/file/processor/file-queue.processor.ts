import { Process, Processor } from "@nestjs/bull"
import { Logger } from "@nestjs/common"
import { Job } from "bull"
import { FileService } from "../service/files.service"
import { DELETE_FILE, DELETE_S3_OBJECTS, FILE_QUEUE, UPDATE_MEDIA_METADATA } from "@root/shared/constant/queue"
import { DeleteFileJob, DeleteS3ObjectsJob, UpdateMetadataJob } from "@root/shared/interface/file"

@Processor(FILE_QUEUE)
export class FileQueueProcessor {
  private readonly logger = new Logger(FileQueueProcessor.name)

  constructor(private readonly fileService: FileService) {}

  @Process({ name: DELETE_FILE, concurrency: 5 })
  async deleteFile(job: Job) {
    try {
      const data = <DeleteFileJob>job.data
      await this.fileService.delete(data.id)
    } catch (e: unknown) {
      this.logger.error(e)
      this.logger.error(job.name, job.data)
    }
  }

  @Process({ name: DELETE_S3_OBJECTS, concurrency: 2 })
  async deleteS3Objects(job: Job) {
    try {
      const data = <DeleteS3ObjectsJob>job.data
      await this.fileService.deleteS3Objects(data.keys, data.bucketName)
    } catch (e: unknown) {
      this.logger.error(e)
      this.logger.error(job.name, job.data)
    }
  }

  @Process({ name: UPDATE_MEDIA_METADATA, concurrency: 5 })
  async updateMediaMetadata(job: Job) {
    try {
      const data = <UpdateMetadataJob>job.data
      await this.fileService.updateMultipleMediaMetadata(data.ids, data.metadata)
    } catch (e: unknown) {
      this.logger.error(e)
      this.logger.error(job.name, job.data)
    }
  }
}
