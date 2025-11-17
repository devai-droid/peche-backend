export type ButtonTarget = "out"
export type ButtonType =
  | "WL" /*웹링크*/
  | "AL" /*앱링크*/
  | "DS" /*배송 조회*/
  | "BK" /*봇 키워드*/
  | "MD" /*메시지 전달*/
  | "BC" /*상담톡 전환*/
  | "BT" /*봇 전환*/
  | "AC" /*채널 추가*/

export interface BizMsgResendParameter {
  isResend?: boolean
  resendType?: string
  resendTitle?: string
  resendContent?: string
  resendSendNo?: string
}

export interface BizMsgButton {
  ordering?: number
  chatExtra?: string
  chatEvent?: string
  type?: ButtonType
  target?: ButtonTarget
  name?: string
  linkMo?: string
  linkPc?: string
  schemeIos?: string
  schemeAndroid?: string
}

export interface BizMsgRecipient {
  recipientNo: string
  templateParameter?: Record<string, string>
  resendParameter?: BizMsgResendParameter
  buttons?: BizMsgButton[]
  recipientGroupingKey?: string
}

export interface BizMsgMessageOption {
  price?: number
  currencyType?: string
}

export interface BizMsgMessage {
  senderKey: string
  templateCode: string
  recipientList: BizMsgRecipient[]
  requestDate?: string
  senderGroupingKey?: string
  createUser?: string
  messageOption?: BizMsgMessageOption
  statsId?: string
}

export interface BizMsgHeader {
  resultCode: number
  resultMessage: string
  isSuccessful: boolean
}

export interface BizMsgSendResult {
  recipientSeq: number
  recipientNo: string
  resultCode: number
  resultMessage: string
  recipientGroupingKey: string
}

export interface BizMsgResMessage {
  requestId: string
  senderGroupingKey: string
  sendResults: BizMsgSendResult[]
}

export interface BizMsgResponse {
  header: BizMsgHeader
  message: BizMsgResMessage
}
