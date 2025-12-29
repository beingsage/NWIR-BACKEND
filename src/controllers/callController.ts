import type { Request, Response } from 'express'
import twilio from 'twilio'
const VoiceResponse = (twilio as any).twiml.VoiceResponse
const MessagingResponse = (twilio as any).twiml.MessagingResponse
import { inferLocation } from '../services/locationEngine'

export async function incomingCall(req: Request, res: Response) {
  const from = req.body.From as string | undefined
  const to = req.body.To as string | undefined
  const callSid = req.body.CallSid as string | undefined

  // Immediately reject the call to minimize time on call (cheaper than answering)
  const twiml = new VoiceResponse()
  twiml.reject({ reason: 'busy' })

  // Fire-and-forget store of call log; don't block Twilio's response
  ;(async () => {
    try {
      const db = await import('../repo/db')
      if (db && db.createCallLog) {
        await db.createCallLog({ phone: from, to, callSid, direction: 'call' })
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save call log:', (e as Error).message)
    }
  })()

  res.type('text/xml')
  res.send(twiml.toString())
}

export async function incomingSms(req: Request, res: Response) {
  const from = req.body.From as string | undefined
  const body = req.body.Body as string | undefined

  const inference = await inferLocation({ phone: from, text: body })

  // Log inbound SMS as well
  ;(async () => {
    try {
      const db = await import('../repo/db')
      if (db && db.createCallLog) {
        await db.createCallLog({ phone: from, to: req.body.To, callSid: req.body.MessageSid, direction: 'sms', body })
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save sms log:', (e as Error).message)
    }
  })()

  const msg = new MessagingResponse()
  msg.message(`Estimated: ${inference.estimated_location}. Confidence: ${Math.round(inference.confidence * 100)}%. Sources: ${Object.keys(inference.sources).join(', ')}`)

  res.type('text/xml')
  res.send(msg.toString())
}
