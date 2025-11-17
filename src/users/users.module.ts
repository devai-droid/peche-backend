import { forwardRef, Module } from "@nestjs/common"
import { UserService } from "./service/user.service"
import { UserController } from "./controller/user.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AccountUser } from "./entities/user.entity"
import { AuthModule } from "@root/auth/auth.module"
import { FileModule } from "@root/file/file.module"
import { SmartDoctorModule } from "@root/smart-doctor/smart-doctor.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountUser]),
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule),
    forwardRef(() => SmartDoctorModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
