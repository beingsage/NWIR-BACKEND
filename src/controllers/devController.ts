import type { Request, Response } from 'express'
import { inferLocation } from '../services/locationEngine'
import * as repo from '../repo/db'
import config from '../config/dev'

export async function mockCall(req: Request, res: Response) {
  if (config.TELECOM_MODE !== 'MOCK') {
    return res.status(403).json({ error: 'Mock telecom disabled' })
  }

  const from = req.body.from as string | undefined
  const digits = req.body.digits as string | undefined
  const text = req.body.text as string | undefined

  // If digits present, optionally map to text or context
  const simulatedText = text || (digits ? `dtmf ${digits}` : undefined)

  const inference = await inferLocation({ phone: from, text: simulatedText })

  // Log the simulated call as a call log
  try {
    await repo.createCallLog({ phone: from, to: req.body.to || 'MOCK', callSid: req.body.callSid || 'MOCK', direction: 'mock-call', body: { digits, text } })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to save mock call log:', (e as Error).message)
  }

  return res.json({ simulated: true, inference })
}

export async function mockSms(req: Request, res: Response) {
  if (config.TELECOM_MODE !== 'MOCK') {
    return res.status(403).json({ error: 'Mock telecom disabled' })
  }

  const from = req.body.from as string | undefined
  const text = req.body.text as string | undefined

  const inference = await inferLocation({ phone: from, text })

  try {
    await repo.createCallLog({ phone: from, to: req.body.to || 'MOCK', callSid: req.body.messageSid || 'MOCK', direction: 'mock-sms', body: { text } })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to save mock sms log:', (e as Error).message)
  }

  return res.json({ simulated: true, inference })
}

export async function sendMessage(req: Request, res: Response) {
  if (config.TELECOM_MODE !== 'MOCK') {
    return res.status(403).json({ error: 'Mock telecom disabled' })
  }

  const phone = req.body.phone as string | undefined
  const body = req.body.body as string | undefined
  if (!phone || !body) return res.status(400).json({ error: 'phone and body are required' })

  try {
    const tw = await import('../services/twilio')
    const db = await import('../repo/db')
    const resp = await tw.sendWhatsAppMessage(phone, body)
    if (db && db.createWhatsappMessage) {
      await db.createWhatsappMessage({ phone, type: 'outbound', content: { body, twilioSid: resp.sid }, timestamp: new Date() })
    }
    return res.json({ ok: true, sid: resp.sid })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to send message (dev/send-message):', (e as Error).message)
    return res.status(500).json({ error: 'send_failed' })
  }
}
