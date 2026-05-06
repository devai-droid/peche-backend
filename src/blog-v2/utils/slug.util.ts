/**
 * 한글·영문·숫자·하이픈만 남기는 slug 정규화.
 * - 공백 → 하이픈
 * - 연속 하이픈 → 1개
 * - 양끝 하이픈 제거
 * - 100자 제한
 */
export function normalizeSlug(text: string): string {
  if (!text) return ""
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100)
}
