import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { ArrayContains, FindManyOptions, ILike, Repository } from "typeorm"
import { paginate } from "@root/shared/pagination"
import { compare, hash } from "bcryptjs"
import * as _ from "lodash"

import { UpdateUserDto, UserDto, UserDtoHelper } from "../dto/user.dto"
import { AccountUser } from "../entities/user.entity"
import { BCRYPT_SALT_ROUNDS } from "../../shared/constant/auth"
import { User } from "../../shared/interface/user"
import { UserQueryDto } from "../dto/user-query.dto"
import { AuthExceptionType, Role } from "../../shared/enum/auth"
import { AuthException } from "../../shared/exception/auth-exception"
import { UserStatus } from "@root/shared/enum/user"
import { FileObject } from "@root/file/entities/file-object.entity"
import { FileService } from "@root/file/service/files.service"
import { SmartDoctorRepository } from "@root/smart-doctor/repository/smart-doctor.repository"

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(AccountUser) private readonly repository: Repository<AccountUser>,
    @Inject(forwardRef(() => FileService)) private readonly fileService: FileService,
    private readonly smartDoctorRepository: SmartDoctorRepository,
  ) {}

  async create(dto: UserDto, createdBy?: User) {
    await this.checkExistUser(dto)
    const user = UserDtoHelper.toEntity(dto)
    if (dto.password) {
      user.password = await hash(dto.password, BCRYPT_SALT_ROUNDS)
    }
    return this.repository.save(Object.assign(user, { roles: [Role.USER], createdBy: createdBy?.id }))
  }

  async findManyWithPaginationQuery(query?: UserQueryDto) {
    const findOptions = {
      where: {
        ...(query?.phoneNumber && { phoneNumber: ILike(`%${query.phoneNumber}%`) }),
        ...(query?.email && { email: ILike(`%${query.email}%`) }),
        ...(query?.name && { name: ILike(`%${query.name}%`) }),
        ...(query?.status && { status: query.status }),
        ...(query?.role && { roles: ArrayContains([query.role]) }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<AccountUser>(this.repository, query.paginationOptions(), findOptions)
  }

  async findMany(findManyOption?: FindManyOptions<AccountUser>) {
    return await this.repository.find(findManyOption)
  }

  async findByEmail(email: string) {
    return this.repository.findOneByOrFail({ email: email })
  }

  async findMe(id: string) {
    return await this.findOne(id)
  }

  async findOne(id: string) {
    return this.repository.findOneByOrFail({ id: id })
  }

  async findOneOrNull(id?: string) {
    return id ? this.repository.findOne({ where: { id: id } }) : null
  }

  async update(id: string, dto: UpdateUserDto, updatedBy?: User) {
    const user = await this.findOne(id)
    await this.checkExistUser(dto)
    const updated = await this.repository.save(Object.assign(user, dto, { updatedBy: updatedBy?.id }))
    if (dto.languageLocale && updated.customerNumber) {
      await this.smartDoctorRepository.updateCustomer(updated)
    }
    return this.updateUserProfile(dto, updated)
  }

  async updatePassword(id: string, password: string) {
    const user = await this.findOne(id)
    user.password = await hash(password, BCRYPT_SALT_ROUNDS)
    return await this.repository.save(user)
  }

  async updateAdmin(id: string) {
    const user = await this.findOne(id)
    return await this.addAdminRole(user)
  }

  async updateCustomerNumber(id: string, customerNumber: string) {
    const user = await this.findOne(id)
    user.customerNumber = customerNumber
    return await this.repository.save(user)
  }

  async verifyUser(id: string) {
    const user = await this.findOne(id)
    user.status = UserStatus.VERIFIED
    return await this.repository.save(user)
  }

  async removeAdmin(id: string) {
    const user = await this.findOne(id)
    return await this.removeAdminRole(user)
  }

  async remove(id: string) {
    const user = await this.findOne(id)
    await this.repository.remove(user)
  }

  async isExistByProviderSub(providerSub?: string): Promise<boolean> {
    return (await this.repository.countBy({ providerSub })) > 0
  }

  async isExistById(id?: string): Promise<boolean> {
    return (await this.repository.countBy({ id })) > 0
  }

  async removeAdminRole(user: AccountUser) {
    user.roles = _.filter(user.roles, function (item) {
      return item !== Role.ADMIN
    })
    return await this.repository.save(user)
  }

  async deleteAccount(id: string, user?: User) {
    return this.inactivateAccount(id, user)
  }

  async checkExistUser(dto: UserDto) {
    if (dto.phoneNumber && (await this.isExistByPhoneNumber(dto.phoneNumber))) {
      throw new ConflictException(`동일한 전화번호(${dto.phoneNumber})를 사용하는 사용자가 이미 있습니다.`)
    }
    if (dto.email && (await this.isExistByEmail(dto.email))) {
      throw new ConflictException(`동일한 이메일(${dto.email})를 사용하는 사용자가 이미 있습니다.`)
    }
  }

  async checkIsCorrectPassword(user: AccountUser, password: string) {
    if (!user || user.status == UserStatus.INACTIVE) {
      throw new AuthException(AuthExceptionType.UNAUTHORIZED)
    }
    if (!user.password) {
      throw new AuthException(AuthExceptionType.WRONG_ATTEMPT)
    }
    return compare(password, user.password)
  }

  async findByProviderSub(providerSub?: string) {
    return await this.repository.findOneBy({ providerSub })
  }

  async inactivateAccount(id: string, updatedBy?: User) {
    await this.checkUserNotFoundById(id)
    const user = await this.findOne(id)
    return await this.repository.save(Object.assign(user, { status: UserStatus.INACTIVE, updatedBy: updatedBy?.id }))
  }

  async getFileObject(fileId?: string): Promise<FileObject | undefined> {
    return fileId ? await this.fileService.findOne(fileId) : undefined
  }

  async findOneByPhoneNumber(phoneNumber: string) {
    return this.repository.findOneBy({ phoneNumber: phoneNumber })
  }

  async isExistByPhoneNumber(phoneNumber?: string): Promise<boolean> {
    return phoneNumber ? await this.isExist(phoneNumber) : false
  }

  async isExistByEmail(email?: string): Promise<boolean> {
    return email ? (await this.repository.countBy({ email: email })) > 0 : false
  }

  private async addAdminRole(user: AccountUser) {
    user.roles = _.union(user.roles, [Role.ADMIN])
    return await this.repository.save(user)
  }

  private async checkUserNotFoundById(id: string) {
    if (!(await this.isExistById(id))) {
      throw new NotFoundException()
    }
  }

  private async isExist(phoneNumber?: string): Promise<boolean> {
    return (await this.repository.countBy({ phoneNumber: phoneNumber })) > 0
  }

  private async removeFileObject(id: string, user?: User) {
    return user ? await this.fileService.deleteUserFile(id, user) : await this.fileService.delete(id)
  }

  private isDiffProfile(newProfileId?: string, currentProfileId?: string) {
    return newProfileId && currentProfileId != newProfileId
  }

  private async removeUnusedProfile(currentProfile?: FileObject, profileId?: string) {
    if (currentProfile && this.isDiffProfile(profileId, currentProfile.id)) {
      await this.removeFileObject(currentProfile.id)
    }
  }

  private async getUserProfile(dto: UserDto, user: AccountUser) {
    return this.isDiffProfile(dto.profileId, user.profile?.id) ? await this.getFileObject(dto.profileId) : user.profile
  }

  private async updateUserProfile(dto: UserDto, user: AccountUser) {
    const profile = dto.profileId ? await this.getUserProfile(dto, user) : null
    if (profile) {
      const currentProfile = user.profile
      user = await this.repository.save(Object.assign(user, { profile: profile }))
      await this.removeUnusedProfile(currentProfile, profile?.id)
    }
    return user
  }
}
