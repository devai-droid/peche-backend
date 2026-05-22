import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class UploadBlogPostDto {
  @ApiProperty({
    description: ".md 파일 전체 내용 (frontmatter + 본문 마크다운)",
    example: "---\ntitle: 보톡스 시술 후 운동\nslug: botox-exercise-timing\nmain_keyword: 보톡스 운동\n---\n\n## 본문\n...",
  })
  @IsString()
  @IsNotEmpty()
  markdown: string
}
