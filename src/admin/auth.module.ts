import { forwardRef, Module } from "@nestjs/common"
import { UsersModule } from "../users/users.module"
import { MessageModule } from "@root/message/message.module"
import { AdminUserController } from "@root/admin/controller/admin-user.controller"
import { AuthModule } from "@root/auth/auth.module"
import { AdminSmsController } from "@root/admin/controller/admin-sms.controller"

@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => MessageModule), forwardRef(() => AuthModule)],
  controllers: [AdminUserController, AdminSmsController],
  providers: [],
  exports: [],
})
export class AdminModule {}
