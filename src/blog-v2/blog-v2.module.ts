import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BlogPostV2 } from "@root/blog-v2/entities/post.entity"
import { BlogKeyword } from "@root/blog-v2/entities/keyword.entity"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"
import { BlogPostSlugHistory } from "@root/blog-v2/entities/post-slug-history.entity"
import { BlogPostCitation } from "@root/blog-v2/entities/post-citation.entity"
import { BlogCommonText } from "@root/blog-v2/entities/common-text.entity"
import { BlogCommonTextService } from "@root/blog-v2/services/blog-common-text.service"
import { BlogCommonTextController } from "@root/blog-v2/controller/blog-common-text.controller"
import { AnthropicService } from "@root/blog-v2/services/anthropic.service"
import { BlogSlugService } from "@root/blog-v2/services/slug.service"
import { BlogSummaryService } from "@root/blog-v2/services/summary.service"
import { BlogV2PostService } from "@root/blog-v2/services/blog-v2-post.service"
import { BlogKeywordService } from "@root/blog-v2/services/blog-keyword.service"
import { BlogDoctorService } from "@root/blog-v2/services/blog-doctor.service"
import { BlogImageUploadService } from "@root/blog-v2/services/blog-image-upload.service"
import { BlogV2PostController } from "@root/blog-v2/controller/blog-v2-post.controller"
import { BlogKeywordController } from "@root/blog-v2/controller/blog-keyword.controller"
import { BlogDoctorController } from "@root/blog-v2/controller/blog-doctor.controller"
import { BlogPublicController } from "@root/blog-v2/controller/blog-public.controller"
import { BlogRenderService } from "@root/blog-v2/services/blog-render.service"
import { UploadService } from "@root/upload/upload.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogPostV2,
      BlogKeyword,
      BlogDoctor,
      BlogPostSlugHistory,
      BlogPostCitation,
      BlogCommonText,
    ]),
  ],
  controllers: [
    BlogV2PostController,
    BlogKeywordController,
    BlogDoctorController,
    BlogPublicController,
    BlogCommonTextController,
  ],
  providers: [
    AnthropicService,
    BlogSlugService,
    BlogSummaryService,
    BlogV2PostService,
    BlogKeywordService,
    BlogDoctorService,
    BlogImageUploadService,
    BlogRenderService,
    BlogCommonTextService,
    UploadService,
  ],
  exports: [
    AnthropicService,
    BlogSlugService,
    BlogSummaryService,
    BlogV2PostService,
    BlogKeywordService,
    BlogDoctorService,
  ],
})
export class BlogV2Module {}
