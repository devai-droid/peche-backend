import { Controller, Post, Body, Headers } from "@nestjs/common"
import { WebhookService } from "./webhook.service"
import { PaletteWebhookDto } from "./palette-webhook.dto"

@Controller("doctor-palette/webhook")
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  handlePaletteWebhook(@Body() body: PaletteWebhookDto, @Headers("authorization") authHeader: string) {
    return this.webhookService.handlePaletteUpdate(body, authHeader)
  }
}
