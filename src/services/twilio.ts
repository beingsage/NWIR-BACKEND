import Twilio from 'twilio'

const SID = process.env.TWILIO_ACCOUNT_SID
const TOKEN = process.env.TWILIO_AUTH_TOKEN
const FROM = process.env.TWILIO_PHONE_NUMBER
const MESSAGING_SID = process.env.TWILIO_MESSAGING_SID

let client: Twilio.Twilio | null = null
if (SID && TOKEN) client = Twilio(SID, TOKEN)

export async function sendWhatsAppMessage(toPhone: string, body: string, opts: { mediaUrl?: string } = {}) {
  if (!client) throw new Error('Twilio client not configured')
  const to = `whatsapp:${toPhone}`
  const msgParams: any = { to, body }
  if (opts.mediaUrl) msgParams.mediaUrl = [opts.mediaUrl]
  if (MESSAGING_SID) {
    msgParams.messagingServiceSid = MESSAGING_SID
  } else if (FROM) {
    msgParams.from = `whatsapp:${FROM}`
  }

  const res = await client.messages.create(msgParams)
  return res
}

export async function sendSms(toPhone: string, body: string) {
  if (!client) throw new Error('Twilio client not configured')
  const res = await client.messages.create({ from: process.env.TWILIO_PHONE_NUMBER, to: toPhone, body })
  return res
}

export default { sendWhatsAppMessage, sendSms }
