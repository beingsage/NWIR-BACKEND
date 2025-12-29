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
})
