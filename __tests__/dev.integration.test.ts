import request from 'supertest'
import app from '../src/index'

describe('Dev telecom simulation endpoints', () => {
  beforeAll(() => {
    process.env.TELECOM_MODE = 'MOCK'
  })

  test('mock-call returns inference and logs the call', async () => {
    const spy = jest.spyOn(require('../src/repo/db'), 'createCallLog').mockResolvedValue({})

    const res = await request(app)
      .post('/dev/mock-call')
      .send({ from: '+919812345678', digits: '1234', text: 'help near MUJ' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('simulated', true)
    expect(res.body).toHaveProperty('inference')
    expect(res.body.inference.estimated_location).toBeDefined()
    expect(spy).toHaveBeenCalled()

    spy.mockRestore()
  })

  test('mock-sms returns inference and logs the sms', async () => {
    const spy = jest.spyOn(require('../src/repo/db'), 'createCallLog').mockResolvedValue({})

    const res = await request(app)
      .post('/dev/mock-sms')
      .send({ from: '+919912345678', text: 'help near MUJ' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('simulated', true)
    expect(res.body).toHaveProperty('inference')
    expect(res.body.inference.estimated_location).toBeDefined()
    expect(spy).toHaveBeenCalled()

    spy.mockRestore()
  })

  test('send-message sends outbound WhatsApp and logs it', async () => {
    const tw = require('../src/services/twilio')
    const db = require('../src/repo/db')
    const spySend = jest.spyOn(tw, 'sendWhatsAppMessage').mockResolvedValue({ sid: 'SM123' })
    const spyLog = jest.spyOn(db, 'createWhatsappMessage').mockResolvedValue({})

    const res = await request(app).post('/dev/send-message').send({ phone: '+15550002222', body: 'Test outbound' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('ok', true)
    expect(res.body).toHaveProperty('sid', 'SM123')
    expect(spySend).toHaveBeenCalled()
    expect(spyLog).toHaveBeenCalled()

    spySend.mockRestore()
    spyLog.mockRestore()
  })
})
