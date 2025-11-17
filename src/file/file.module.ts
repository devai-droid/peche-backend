import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { FileObject } from "./entities/file-object.entity"
import { FileService } from "./service/files.service"
import { BullModule } from "@nestjs/bull"
import { FILE_QUEUE } from "@root/shared/constant/queue"
import { FileController } from "@root/file/controller/file.controller"

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([FileObject]), BullModule.registerQueue({ name: FILE_QUEUE })],
  providers: [FileService],
  exports: [FileService],
  controllers: [FileController],
})
export class FileModule {}
