import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SystemConstants } from "@root/system/entities/system-constants.entity"
import { SystemConstantsController } from "@root/system/controller/system-constants.controller"
import { SystemConstantsService } from "@root/system/service/system-constants.service"
import { ProductModule } from "@root/product/product.module"
import { FileModule } from "@root/file/file.module"
import { MainPopup } from "@root/system/entities/main-popup.entity"
import { MainProduct } from "@root/system/entities/main-product.entity"
import { MainPopupController } from "@root/system/controller/main-popup.controller"
import { MainProductController } from "@root/system/controller/main-product.controller"
import { MainPopupService } from "@root/system/service/main-popup.service"
import { MainProductService } from "@root/system/service/main-product.service"
import { MainImageController } from "@root/system/controller/main-image.controller"
import { MainImageService } from "@root/system/service/main-image.service"
import { PopularProduct } from "@root/system/entities/popular-product.entity"
import { PopularProductController } from "@root/system/controller/popular-product.controller"
import { PopularProductService } from "@root/system/service/popular-product.service"
import { SearchKeywordController } from "@root/system/controller/search-keyword.controller"
import { EquipmentController } from "@root/system/controller/equipment.controller"
import { EquipmentService } from "@root/system/service/equipment.service"
import { MemberController } from "@root/system/controller/member.controller"
import { SearchKeywordService } from "@root/system/service/search-keyword.service"
import { MainImage } from "@root/system/entities/main-image.entity"
import { SearchKeyword } from "@root/system/entities/search-keyword.entity"
import { Equipment } from "@root/system/entities/equipment.entity"
import { Member } from "@root/system/entities/member.entity"
import { MemberService } from "@root/system/service/member.service"
import { EventModule } from "@root/event/event.module"
import { SearchService } from "@root/system/service/search.service"
import { SearchController } from "@root/system/controller/search.controller"
import { HospitalInfo } from "./entities/hospital-info.entity"
import { HospitalInfoController } from "./controller/hospital-info.controller"
import { HospitalInfoService } from "./service/hospital-info.service"
import { CelebPictures } from "./entities/celeb-pictures.entity"
import { CelebPicturesController } from "./controller/celeb-pictures.controller"
import { CelebPicturesService } from "./service/celeb-pictures.service"
import { MostPopularCategory } from "./entities/most-popular-category.entity"
import { MostPopularItem } from "./entities/most-popular-item.entity"
import { MostPopularCategoryService } from "./service/most-popular-category.service"
import { MostPopularItemService } from "./service/most-popular-item.service"
import { MostPopularCategoryController } from "./controller/most-popular-category.controller"
import { MostPopularItemController } from "./controller/most-popular-item.controller"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemConstants,
      MainPopup,
      MainProduct,
      MainImage,
      PopularProduct,
      SearchKeyword,
      Equipment,
      Member,
      HospitalInfo,
      CelebPictures,
      MostPopularCategory,
      MostPopularItem,
    ]),
    forwardRef(() => ProductModule),
    forwardRef(() => EventModule),
    forwardRef(() => FileModule),
  ],
  controllers: [
    SystemConstantsController,
    MainPopupController,
    MainProductController,
    MainImageController,
    PopularProductController,
    SearchKeywordController,
    EquipmentController,
    MemberController,
    SearchController,
    HospitalInfoController,
    CelebPicturesController,
    MostPopularCategoryController,
    MostPopularItemController,
  ],
  providers: [
    SystemConstantsService,
    MainPopupService,
    MainProductService,
    MainImageService,
    PopularProductService,
    SearchKeywordService,
    EquipmentService,
    MemberService,
    SearchService,
    HospitalInfoService,
    CelebPicturesService,
    MostPopularCategoryService,
    MostPopularItemService,
  ],
  exports: [
    SystemConstantsService,
    MainPopupService,
    MainProductService,
    MainImageService,
    PopularProductService,
    SearchKeywordService,
    EquipmentService,
    MemberService,
    SearchService,
    HospitalInfoService,
    CelebPicturesService,
    MostPopularCategoryService,
    MostPopularItemService,
  ],
})
export class SystemModule {}
