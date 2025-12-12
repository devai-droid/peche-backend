export class PaletteWebhookDto {
  id: string
  hospitalId: string
  patientId: string
  scheduleId: string
  dateTime: string
  status: "REQUESTED" | "CONFIRMED"
  treatments: string[]
  requestMessage?: string
  cancelInfo?: any
  createdAt: string
  updatedAt: string
}
