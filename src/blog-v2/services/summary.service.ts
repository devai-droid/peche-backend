import { Injectable, Logger } from "@nestjs/common"
import { AnthropicService } from "@root/blog-v2/services/anthropic.service"

const MIN_LEN = 100
const MAX_LEN = 200
const MAX_RETRY = 3

@Injectable()
export class BlogSummaryService {
  private readonly logger = new Logger(BlogSummaryService.name)

  constructor(private readonly anthropic: AnthropicService) {}

  /**
   * 본문 마크다운에서 100~150자(허용 200자) 한글 요약 생성.
   * - 첫 문장: 결론형 "○○는 ~입니다"
   * - 마지막 문장: 해결책/표준 치료 (수치 1개 이상 포함)
   * - 모든 문장 "~입니다" 존댓말 종결
   * - 실패 시 null 반환 (저장 단계에서 NULL 허용)
   */
  async generate(input: { title: string; bodyMd?: string }): Promise<string | null> {
    const { title, bodyMd = "" } = input
    if (!this.anthropic.hasApiKey()) {
      this.logger.warn("ANTHROPIC_API_KEY 없음 — 요약 생성 스킵")
      return null
    }
    if (!title) return null
    if (bodyMd.length < 100) {
      this.logger.warn("본문 100자 미만 — 요약 생성 스킵")
      return null
    }

    const isValid = (s: string) => {
      const trimmed = (s || "").trim()
      if (trimmed.length < MIN_LEN || trimmed.length > MAX_LEN) return false
      return /[\.\?!]$/.test(trimmed)
    }

    const truncateToLastSentence = (text: string): string | null => {
      if (!text) return null
      const endings: number[] = []
      const regex = /[가-힣][\.\?!]/g
      let m: RegExpExecArray | null
      while ((m = regex.exec(text)) !== null) {
        endings.push(m.index + m[0].length)
      }
      const valid = endings.filter((i) => i >= MIN_LEN && i <= MAX_LEN)
      if (valid.length === 0) return null
      return text.substring(0, Math.max(...valid)).trim()
    }

    try {
      for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
        const extra =
          attempt === 0
            ? ""
            : `\n\n[재시도 지시 — 반드시 준수]\n직전 결과가 규격(100~150자, 완결 문장)을 위반했다. 이번에는 반드시 120자 내외로 완결된 두 문장으로 작성해라.`

        const prompt = this.buildPrompt(title, bodyMd, extra)
        const raw = (await this.anthropic.complete(prompt, { maxTokens: 220 })).trim().replace(/\s+/g, " ")
        if (isValid(raw)) return raw
        if (raw.length > MAX_LEN) {
          const truncated = truncateToLastSentence(raw)
          if (truncated && isValid(truncated)) return truncated
        }
      }
      this.logger.warn(`summary ${MAX_RETRY}회 시도 실패 — "${title}"`)
      return null
    } catch (err) {
      this.logger.error(`summary LLM 호출 실패: ${(err as Error).message}`)
      return null
    }
  }

  private buildPrompt(title: string, bodyMd: string, extra: string): string {
    return `다음 의료 블로그 포스팅의 핵심 요약을 작성해줘.

규칙 (엄격히 준수):
- 길이: 반드시 한글 기준 100자 이상 150자 이내 (공백·구두점 포함). 100자 미만이거나 150자 초과 시 실패로 간주.
- 문장 수: 2~3문장. 모든 문장은 "~입니다" / "~합니다" / "~됩니다" 존댓말 종결로 마무리 (본문 어투와 일치).
- 구조 (반드시 준수): [첫 문장] 주제·정의·원인을 "○○는 ~입니다" 결론형으로 단정 → [마지막 문장] 해결 방법·표준 치료·수치를 제시.
- 수치·통계·표준 치료명 최소 1개 포함 (예: "지속 효과 6개월", "회복 1~2일", "히알루론산 필러", "보툴리눔톡신")
- 마지막 문장은 반드시 해결책/치료 방법에 대한 정보로 마무리. 문제·원인만 서술하고 끝나면 안 됨.
- 금지어: "~을 알아보세요", "~에 대해 소개합니다", "~을 살펴봅니다" 같은 유도형 문구 (스니펫 추출 실패 원인)
- 금지어: "~이다", "~한다", "~된다" 등 반말·논문체 종결
- 의료법 준수: 일반론 수준, 개별 진료 조언·광고성 표현 금지
- 출력: 요약문 한 단락만. 다른 설명·인사·따옴표·헤드라인 없이.

제목: ${title}

본문(마크다운):
${bodyMd.substring(0, 3000)}${extra}`
  }
}
