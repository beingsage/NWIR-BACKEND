import type { Request, Response } from 'express'
import * as db from '../db/mongo'

// Verify endpoint (GET) and webhook receiver (POST)
export async function verify(req: Request, res: Response) {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge as string)
  }
  res.sendStatus(403)
}

export async function handleMessage(req: Request, res: Response) {
  try {
    const entry = req.body.entry?.[0]
    const changes = entry?.changes?.[0]
    const message = changes?.value?.messages?.[0]

    if (!message) return res.sendStatus(200)

    const phone = message.from
    const name = changes?.value?.contacts?.[0]?.profile?.name
    const type = message.type

    // Upsert contact and store message (don't let DB failures break webhook)
    try {
      if (type === 'location') {
        const loc = { lat: message.location.latitude, lng: message.location.longitude }
        await db.upsertWhatsappContact({ phone, name, lastLocation: loc, updatedAt: new Date() })
      } else {
        await db.upsertWhatsappContact({ phone, name, updatedAt: new Date() })
      }

      await db.createWhatsappMessage({ phone, type, content: message, timestamp: new Date() })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save WhatsApp data:', (e as Error).message)
    }

    // Simple command flow: SOS -> create incident
    if (type === 'text') {
      const text = message.text?.body?.trim()?.toUpperCase?.() || ''
      if (text === 'SOS') {
        await db.createIncident({ workerId: phone, status: 'open', details: { via: 'whatsapp' } })
      }
    }

    return res.sendStatus(200)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('WhatsApp webhook error', err)
    return res.sendStatus(500)
  }
}

export default { handleMessage, verify }
