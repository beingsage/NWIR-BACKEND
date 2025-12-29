import request from 'supertest'
import app from '../src/index'

describe('Twilio webhooks', () => {
  test('incoming call responds with TwiML and inferred region from number prefix', async () => {
    const spy = jest.spyOn(require('../src/repo/db'), 'createCallLog').mockResolvedValue({})

    const res = await request(app).post('/twilio/incoming').type('form').send({ From: '+919812345678' })

    expect(res.status).toBe(200)
    expect(res.type).toContain('xml')
    expect(res.text).toContain('<Reject')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  test('incoming SMS uses user context to update inference', async () => {
    const spy = jest.spyOn(require('../src/repo/db'), 'createCallLog').mockResolvedValue({})

    const res = await request(app)
      .post('/twilio/sms')
      .type('form')
      .send({ From: '+919912345678', Body: 'help near MUJ' })

    expect(res.status).toBe(200)
    expect(res.type).toContain('xml')
    expect(res.text).toContain('Estimated: Jaipur')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
