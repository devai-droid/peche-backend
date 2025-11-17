import { Readable } from "stream"

export type MetadataValue = string
export type Metadata = { [key: string]: MetadataValue }

export interface S3Object {
  bucket: string
  key: string
  contentType: string
  directory?: string
}

export interface ReadableFileStream {
  contentType?: string
  contentLength?: number
  stream: () => Promise<Readable>
}

export interface MediaMetadata {
  user_id?: string
}

export interface MediaMetadataWithIds extends MediaMetadata {
  ids: string[]
}

export type UserMetadata = {
  stackName?: string
  sourceBucketName?: string
  sourceObjectKey?: string
  fileObjectId?: string
}

export interface UploadS3Props {
  contentType?: string
  contentLength?: number
  directory?: string
  key?: string
}

export interface DeleteFileJob {
  id: string
}

export interface DeleteS3ObjectsJob {
  keys: string[]
  bucketName: string
}

export interface UpdateMetadataJob {
  ids: string[]
  metadata: Metadata
}
