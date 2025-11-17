import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProductDetailPage } from "@root/product/entities/product-detail-page.entity"
import { Product } from "@root/product/entities/product.entity"
import { ProductBackup } from "@root/product/entities/product-backup.entity"
import { ProductBackupBundle } from "@root/product/entities/product-backup-bundle.entity"
import { ProductCategory } from "@root/product/entities/product-category.entity"
import { RelatedProductDetailPage } from "@root/product/entities/related-product-detail-page.entity"
import { ProductBackupBundleService } from "@root/product/service/product-backup-bundle.service"
import { ProductBackupBundleController } from "@root/product/controller/product-backup-bundle.controller"
import { ProductCategoryService } from "@root/product/service/product-category.service"
import { ProductController } from "@root/product/controller/product.controller"
import { ProductCategoryController } from "@root/product/controller/product-category.controller"
import { ProductDetailPageController } from "@root/product/controller/product-detail-page.controller"
import { ProductService } from "@root/product/service/product.service"
import { ProductBackupService } from "@root/product/service/product-backup.service"
import { ProductDetailPageService } from "@root/product/service/product-detail-page.service"
import { RelatedProductDetailPageService } from "@root/product/service/related-product-detail-page.service"
import { SmartDoctorModule } from "@root/smart-doctor/smart-doctor.module"
import { ProductBackupController } from "@root/product/controller/product-backup.controller"
import { FileModule } from "@root/file/file.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductBackup,
      ProductBackupBundle,
      ProductCategory,
      ProductDetailPage,
      RelatedProductDetailPage,
    ]),
    forwardRef(() => SmartDoctorModule),
    forwardRef(() => FileModule),
  ],
  controllers: [
    ProductController,
    ProductBackupController,
    ProductBackupBundleController,
    ProductCategoryController,
    ProductDetailPageController,
  ],
  providers: [
    ProductService,
    ProductBackupService,
    ProductBackupBundleService,
    ProductCategoryService,
    ProductDetailPageService,
    RelatedProductDetailPageService,
  ],
  exports: [
    ProductService,
    ProductBackupService,
    ProductBackupBundleService,
    ProductCategoryService,
    ProductDetailPageService,
    RelatedProductDetailPageService,
  ],
})
export class ProductModule {}
