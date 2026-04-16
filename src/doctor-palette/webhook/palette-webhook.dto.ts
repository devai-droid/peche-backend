export class PaletteWebhookDto {
  id: string
  hospitalId: string
  patientId: string
  scheduleId: string
  dateTime: string
  status: "REQUESTED" | "CONFIRMED" | "CANCELED" | "ENCOUNTERED" | "COMPLETED"
  treatments: string[]
  requestMessage?: string
  cancelInfo?: any
  createdAt: string
  updatedAt: string
}
