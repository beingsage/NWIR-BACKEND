import request from 'supertest'
import app from '../src/index'

describe('WhatsApp webhooks', () => {
  test('verification handshake returns challenge when token matches', async () => {
    process.env.WHATSAPP_VERIFY_TOKEN = 'verifyme'

    const res = await request(app)
      .get('/whatsapp')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'verifyme', 'hub.challenge': 'CHALLENGE' })

    expect(res.status).toBe(200)
    expect(res.text).toBe('CHALLENGE')
  })

  test('location webhook stores contact and message', async () => {
    const db = require('../src/db/mongo')
    const spyUpsert = jest.spyOn(db, 'upsertWhatsappContact').mockResolvedValue({})
    const spyMsg = jest.spyOn(db, 'createWhatsappMessage').mockResolvedValue({})

    const body = {
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ profile: { name: 'Alice' } }],
                messages: [
                  {
                    from: '+1234567890',
                    type: 'location',
                    location: { latitude: 26.9124, longitude: 75.7873 },
                  },
                ],
              },
            },
          ],
        },
      ],
    }

    const res = await request(app).post('/whatsapp').send(body)

    expect(res.status).toBe(200)
    expect(spyUpsert).toHaveBeenCalled()
    expect(spyMsg).toHaveBeenCalled()

    spyUpsert.mockRestore()
    spyMsg.mockRestore()
  })

  test('text SOS creates an incident', async () => {
    const db = require('../src/db/mongo')
    const spyUpsert = jest.spyOn(db, 'upsertWhatsappContact').mockResolvedValue({})
    const spyMsg = jest.spyOn(db, 'createWhatsappMessage').mockResolvedValue({})
    const spyIncident = jest.spyOn(db, 'createIncident').mockResolvedValue({})

    const body = {
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ profile: { name: 'Bob' } }],
                messages: [
                  { from: '+999888777', type: 'text', text: { body: 'SOS' } },
                ],
              },
            },
          ],
        },
      ],
    }

    const res = await request(app).post('/whatsapp').send(body)

    expect(res.status).toBe(200)
    expect(spyUpsert).toHaveBeenCalled()
    expect(spyMsg).toHaveBeenCalled()
    expect(spyIncident).toHaveBeenCalled()

    spyUpsert.mockRestore()
    spyMsg.mockRestore()
    spyIncident.mockRestore()
  })
})
