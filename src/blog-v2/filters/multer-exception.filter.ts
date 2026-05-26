import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common"
import { Response } from "express"

/**
 * 업로드 라우트 전용 예외 필터.
 * - multer 한도 초과(파일 크기/개수)를 무의미한 500 대신 명확한 한국어 메시지(400)로 변환.
 *   (multer 패키지를 직접 import 하지 않고 에러 형태로 판별 — pnpm 런타임 의존성 문제 방지)
 * - 그 외 HttpException(서비스의 BadRequest 등)은 상태/본문 그대로 전달.
 */
@Catch()
export class UploadExceptionFilter implements ExceptionFilter {
  catch(err: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>()
    const anyErr = err as { name?: string; code?: string; message?: string }

    if (anyErr?.name === "MulterError") {
      let message = `파일 업로드 오류입니다: ${anyErr.message ?? ""}`
      if (anyErr.code === "LIMIT_FILE_SIZE") {
        message = "30MB를 넘는 파일이 있습니다. 개별 파일을 30MB 이하로 줄여서 올려주세요."
      } else if (anyErr.code === "LIMIT_FILE_COUNT") {
        message = "파일이 너무 많습니다. 한 번에 최대 50개까지 올릴 수 있습니다."
      }
      res.status(HttpStatus.BAD_REQUEST).json({ statusCode: 400, message, error: "Bad Request" })
      return
    }

    if (err instanceof HttpException) {
      res.status(err.getStatus()).json(err.getResponse())
      return
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: "Internal server error",
    })
  }
}
