import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common"
import { I18nContext, I18nTranslation } from "nestjs-i18n"
import { Path } from "nestjs-i18n/dist/types"
import { MessageException } from "./message.exception"

@Catch(MessageException)
export class MessageExceptionFilter implements ExceptionFilter {
  catch(exception: MessageException, host: ArgumentsHost) {
    const i18n = I18nContext.current<I18nTranslation>(host)
    const response = host.switchToHttp().getResponse<any>()
    const status = exception.status

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: i18n.translate(exception.message as Path<string>, { lang: i18n.lang }),
      error: exception.name,
    })
  }
}
