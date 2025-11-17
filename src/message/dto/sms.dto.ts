import { LanguageLocale } from "@root/shared/enum/auth"

export interface PinpointProps {
  phoneNumber: string
  templateName: string
  substitutions?: Record<string, string[]>
  userLocale?: LanguageLocale
}
