import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { VerificationCode, VerificationType } from "../entities/verification-code.entity"
import { CreateVerificationDto, PasswordResetDto, VerifiedCode } from "../dto/verification.dto"
import { randomXDigit } from "@root/shared/utils"
import { DEFAULT_VERIFICATION_CODE_DIGIT, SIXTY_SECONDS } from "@root/shared/constant/auth"
import { UserService } from "@root/users/service/user.service"

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationCode) private repository: Repository<VerificationCode>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
  ) {}

  async createPasswordResetVerification(dto: CreateVerificationDto) {
    this.checkIsPasswordResetVerification(dto)
    await this.checkExistEmail(dto)
    await this.create(dto)
    // TODO: send email
  }

  async resetPassword(dto: PasswordResetDto) {
    const entity = await this.repository.findOneBy({
      email: dto.email,
      code: dto.code,
      verificationType: dto.type,
    })
    this.checkVerificationIsValid(entity)
    await this.remove(entity)
    const user = await this.userService.findByEmail(dto.email)
    await this.userService.updatePassword(user.id, dto.password)
    return <VerifiedCode>{
      email: entity.email,
      verified: true,
    }
  }

  async create(dto: CreateVerificationDto) {
    if (await this.isExistByEmail(dto.email, dto.type)) {
      const verification = await this.findOneByEmail(dto.email, dto.type)
      await this.checkVerificationDelay(verification)
      await this.remove(verification)
    }
    const object = <VerificationCode>{
      email: dto.email,
      code: randomXDigit(DEFAULT_VERIFICATION_CODE_DIGIT),
      verificationType: dto.type,
    }
    return await this.repository.save(object)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findOneByEmail(email: string, type: VerificationType) {
    return this.repository.findOneOrFail({ where: { email: email, verificationType: type } })
  }

  async remove(verification: VerificationCode) {
    await this.repository.remove(verification)
  }

  private checkVerificationIsValid(entity: VerificationCode) {
    if (!entity) {
      throw new BadRequestException("Invalid verification code")
    }
  }

  private async checkExistEmail(dto: CreateVerificationDto) {
    await this.userService.findByEmail(dto.email)
  }

  private checkIsPasswordResetVerification(dto: CreateVerificationDto) {
    if (dto.type !== VerificationType.PASSWORD) {
      throw new BadRequestException("잘못된 인증요청입니다.")
    }
  }

  private async isExistByEmail(email: string, type: VerificationType) {
    return (await this.repository.count({ where: { email: email, verificationType: type } })) > 0
  }

  private async checkVerificationDelay(verification: VerificationCode) {
    const createdAt = new Date(verification.createdAt)
    if (Date.now() - createdAt.getTime() < SIXTY_SECONDS) {
      throw new BadRequestException("1분 후 새로운 인증번호를 발급받을 수 있습니다.")
    }
  }
}
