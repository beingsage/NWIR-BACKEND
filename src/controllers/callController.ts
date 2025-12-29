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
  // Handle help/SOS keyword and location messages (Twilio WhatsApp may include Latitude/Longitude)
  const text = (body || '').trim()
  const lat = req.body.Latitude as string | undefined
  const lon = req.body.Longitude as string | undefined

  if (/^(sos|help)$/i.test(text)) {
    // Create an incident and ask user to share live location
    ;(async () => {
      try {
        const db = await import('../repo/db')
        if (db && db.createIncident) {
          await db.createIncident({ workerId: from, status: 'open', details: { via: 'sms' } })
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to create incident:', (e as Error).message)
      }
    })()

    msg.message(
      "We've received your request for help. Please share your live location: open the attachment (paperclip) and choose 'Location' → 'Share live location'. Reply with 'STOP' to cancel."
    )
  } else if (/^stop$/i.test(text)) {
    // Cancel any open incident for this phone
    ;(async () => {
      try {
        const db = await import('../repo/db')
        if (db && db.findOpenIncidentByWorkerId) {
          const incident = await db.findOpenIncidentByWorkerId(from!)
          if (incident && db.updateIncident) {
            await db.updateIncident(incident.id, { status: 'cancelled' })
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to cancel incident:', (e as Error).message)
      }
    })()

    msg.message('Tracking stopped. If you need help again, reply SOS.')
  } else if (lat && lon) {
    // Log the supplied location and confirm
    ;(async () => {
      try {
        const db = await import('../repo/db')
        if (db && db.upsertWhatsappContact) {
          await db.upsertWhatsappContact({ phone: from, lastLocation: { lat: parseFloat(lat), lng: parseFloat(lon) }, updatedAt: new Date() })
        }
        if (db && db.createWhatsappMessage) {
          await db.createWhatsappMessage({ phone: from, type: 'location', content: { latitude: parseFloat(lat), longitude: parseFloat(lon) }, timestamp: new Date() })
        }
        // If there's an open incident for this phone, update it with location details
        if (db && db.findOpenIncidentByWorkerId) {
          const incident = await db.findOpenIncidentByWorkerId(from!)
          if (incident && db.updateIncident) {
            await db.updateIncident(incident.id, { status: 'location_received', details: { ...(incident.details || {}), location: { lat: parseFloat(lat), lng: parseFloat(lon) } } })
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to persist WhatsApp location:', (e as Error).message)
      }
    })()

    msg.message('Location received and logged. Help will be dispatched if you requested assistance.')
  } else {
    msg.message(`Estimated: ${inference.estimated_location}. Confidence: ${Math.round(inference.confidence * 100)}%. Sources: ${Object.keys(inference.sources).join(', ')}`)
  }

  res.type('text/xml')
  res.send(msg.toString())
}
