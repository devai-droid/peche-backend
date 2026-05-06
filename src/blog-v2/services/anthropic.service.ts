import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
const DEFAULT_MODEL = "claude-haiku-4-5-20251001"
const ANTHROPIC_VERSION = "2023-06-01"

interface AnthropicMessage {
  role: "user" | "assistant"
  content: string
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>
}

@Injectable()
export class AnthropicService {
  private readonly logger = new Logger(AnthropicService.name)
  private readonly apiKey?: string

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>("ANTHROPIC_API_KEY")
    if (!this.apiKey) {
      this.logger.warn("ANTHROPIC_API_KEY 미설정 — 자동 생성 hook은 fallback으로 동작")
    }
  }

  hasApiKey(): boolean {
    return !!this.apiKey
  }

  /**
   * Claude Haiku에 프롬프트 보내고 텍스트 응답 받기.
   * apiKey 없으면 ServiceUnavailableException — 호출 측에서 catch해서 fallback 처리.
   */
  async complete(prompt: string, opts: { maxTokens?: number; model?: string } = {}): Promise<string> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException("ANTHROPIC_API_KEY 미설정")
    }

    const body = {
      model: opts.model ?? DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 500,
      messages: [{ role: "user", content: prompt }] as AnthropicMessage[],
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      this.logger.error(`Claude API 호출 실패 (${response.status}): ${errText}`)
      throw new ServiceUnavailableException(`Claude API ${response.status}`)
    }

    const data = (await response.json()) as AnthropicResponse
    return data.content?.[0]?.text ?? ""
  }
}
