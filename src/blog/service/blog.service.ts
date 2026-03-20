import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, In, Repository } from "typeorm"
import { BlogPost } from "@root/blog/entities/blog-post.entity"
import { BlogCategory } from "@root/blog/entities/blog-category.entity"
import { CreateBlogPostDto } from "@root/blog/dto/create-blog-post.dto"
import { UpdateBlogPostDto } from "@root/blog/dto/update-blog-post.dto"
import { CreateBlogCategoryDto } from "@root/blog/dto/create-blog-category.dto"
import { QueryBlogDto } from "@root/blog/dto/query-blog.dto"
import { paginate } from "@root/shared/pagination"
import { User } from "@root/shared/interface/user"

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost) private readonly postRepository: Repository<BlogPost>,
    @InjectRepository(BlogCategory) private readonly categoryRepository: Repository<BlogCategory>,
  ) {}

  async findMany(query: QueryBlogDto) {
    const findOptions = <FindManyOptions<BlogPost>>{
      where: {
        visible: true,
      },
      order: query.orderByOptions(),
      relations: ["categories"],
    }
    if (query.categoryId) {
      findOptions.where = {
        ...(findOptions.where as object),
        categories: { id: query.categoryId },
      }
    }
    if (query.eventCategoryId) {
      findOptions.where = {
        ...(findOptions.where as object),
        eventCategoryId: query.eventCategoryId,
      }
    }
    const result = await paginate<BlogPost>(this.postRepository, query.paginationOptions(), findOptions)
    return {
      data: result.items,
      total: result.meta.totalItems,
      page: result.meta.currentPage,
      lastPage: result.meta.totalPages,
    }
  }

  async findBySlug(slug: string) {
    const post = await this.postRepository.findOne({
      where: { slug },
      relations: ["categories"],
    })
    if (!post) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`)
    }
    post.viewCount += 1
    await this.postRepository.save(post)
    return { data: post }
  }

  async create(dto: CreateBlogPostDto, user?: User) {
    const { categoryIds, ...postData } = dto

    if (!postData.slug) {
      postData.slug = this.generateSlug()
    }

    if (!postData.author) {
      postData.author = user?.email ?? "peche"
    }

    const post = this.postRepository.create(postData)

    if (categoryIds && categoryIds.length > 0) {
      post.categories = await this.categoryRepository.find({
        where: { id: In(categoryIds) },
      })
    }

    const saved = await this.postRepository.save(post)
    return { data: saved }
  }

  private generateSlug(): string {
    const now = new Date()
    const date = now.toISOString().replace(/[-:T.Z]/g, "").slice(2, 14)
    const rand = Math.random().toString(36).slice(2, 6)
    return `post-${date}-${rand}`
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ["categories"],
    })
    if (!post) {
      throw new NotFoundException(`Blog post with id "${id}" not found`)
    }

    const { categoryIds, ...updateData } = dto
    Object.assign(post, updateData)

    if (categoryIds !== undefined) {
      if (categoryIds.length > 0) {
        post.categories = await this.categoryRepository.find({
          where: { id: In(categoryIds) },
        })
      } else {
        post.categories = []
      }
    }

    const saved = await this.postRepository.save(post)
    return { data: saved }
  }

  async remove(id: string) {
    const post = await this.postRepository.findOne({ where: { id } })
    if (!post) {
      throw new NotFoundException(`Blog post with id "${id}" not found`)
    }
    await this.postRepository.remove(post)
    return { success: true }
  }

  // --- Category ---

  async findAllCategories() {
    const categories = await this.categoryRepository.find({
      order: { sortOrder: "ASC" },
    })
    return { data: categories }
  }

  async createCategory(dto: CreateBlogCategoryDto) {
    const category = this.categoryRepository.create(dto)
    const saved = await this.categoryRepository.save(category)
    return { data: saved }
  }

  async updateCategory(id: string, dto: Partial<CreateBlogCategoryDto>) {
    const category = await this.categoryRepository.findOne({ where: { id } })
    if (!category) {
      throw new NotFoundException(`Blog category with id "${id}" not found`)
    }
    Object.assign(category, dto)
    const saved = await this.categoryRepository.save(category)
    return { data: saved }
  }
}
