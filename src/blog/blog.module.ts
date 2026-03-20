import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BlogPost } from "@root/blog/entities/blog-post.entity"
import { BlogCategory } from "@root/blog/entities/blog-category.entity"
import { BlogService } from "@root/blog/service/blog.service"
import { BlogController } from "@root/blog/controller/blog.controller"

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost, BlogCategory])],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
