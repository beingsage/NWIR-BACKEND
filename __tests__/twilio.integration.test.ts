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

  test('incoming SMS SOS creates incident and requests location', async () => {
    const db = require('../src/repo/db')
    const spyCreateCall = jest.spyOn(db, 'createCallLog').mockResolvedValue({})
    const spyCreateIncident = jest.spyOn(db, 'createIncident').mockResolvedValue({})

    const res = await request(app).post('/twilio/sms').type('form').send({ From: '+15550001111', Body: 'SOS' })

    expect(res.status).toBe(200)
    expect(res.type).toContain('xml')
    expect(res.text).toContain('Please share your live location')
    expect(spyCreateCall).toHaveBeenCalled()
    expect(spyCreateIncident).toHaveBeenCalled()

    spyCreateCall.mockRestore()
    spyCreateIncident.mockRestore()
  })

  test('incoming SMS with location updates incident and logs location', async () => {
    const db = require('../src/repo/db')
    const spyCreateCall = jest.spyOn(db, 'createCallLog').mockResolvedValue({})
    const spyUpsert = jest.spyOn(db, 'upsertWhatsappContact').mockResolvedValue({})
    const spyMsg = jest.spyOn(db, 'createWhatsappMessage').mockResolvedValue({})
    const fakeIncident = { id: 'inc-1', worker_id: '+15550001111', status: 'open', details: {} }
    const spyFindInc = jest.spyOn(db, 'findOpenIncidentByWorkerId').mockResolvedValue(fakeIncident)
    const spyUpdate = jest.spyOn(db, 'updateIncident').mockResolvedValue({})

    const res = await request(app)
      .post('/twilio/sms')
      .type('form')
      .send({ From: '+15550001111', Latitude: '12.34', Longitude: '56.78' })

    expect(res.status).toBe(200)
    expect(res.type).toContain('xml')
    expect(res.text).toContain('Location received and logged')
    expect(spyCreateCall).toHaveBeenCalled()
    expect(spyUpsert).toHaveBeenCalled()
    expect(spyMsg).toHaveBeenCalled()
    expect(spyFindInc).toHaveBeenCalled()
    expect(spyUpdate).toHaveBeenCalled()

    spyCreateCall.mockRestore()
    spyUpsert.mockRestore()
    spyMsg.mockRestore()
    spyFindInc.mockRestore()
    spyUpdate.mockRestore()
  })

  test('incoming SMS STOP cancels open incident', async () => {
    const db = require('../src/repo/db')
    const spyCreateCall = jest.spyOn(db, 'createCallLog').mockResolvedValue({})
    const fakeIncident = { id: 'inc-2', worker_id: '+15550001111', status: 'open', details: {} }
    const spyFindInc = jest.spyOn(db, 'findOpenIncidentByWorkerId').mockResolvedValue(fakeIncident)
    const spyUpdate = jest.spyOn(db, 'updateIncident').mockResolvedValue({})

    const res = await request(app).post('/twilio/sms').type('form').send({ From: '+15550001111', Body: 'STOP' })

    expect(res.status).toBe(200)
    expect(res.type).toContain('xml')
    expect(res.text).toContain('Tracking stopped')
    expect(spyCreateCall).toHaveBeenCalled()
    expect(spyFindInc).toHaveBeenCalled()
    expect(spyUpdate).toHaveBeenCalled()

    spyCreateCall.mockRestore()
    spyFindInc.mockRestore()
    spyUpdate.mockRestore()
  })

  test('incoming SMS SOS asks for location', async () => {
    const spy = jest.spyOn(require('../src/repo/db'), 'createCallLog').mockResolvedValue({})

    const res = await request(app).post('/twilio/sms').type('form').send({ From: '+911234567890', Body: 'SOS' })

    expect(res.status).toBe(200)
    expect(res.type).toContain('xml')
    expect(res.text).toContain('Please share your live location')
    spy.mockRestore()
  })

  test('incoming SMS with Latitude/Longitude logs location', async () => {
    const db = require('../src/repo/db')
    const spyUpsert = jest.spyOn(db, 'upsertWhatsappContact').mockResolvedValue({})
    const spyMsg = jest.spyOn(db, 'createWhatsappMessage').mockResolvedValue({})

    const res = await request(app)
      .post('/twilio/sms')
      .type('form')
      .send({ From: '+911234567891', Latitude: '26.9124', Longitude: '75.7873' })

    expect(res.status).toBe(200)
    expect(res.type).toContain('xml')
    expect(res.text).toContain('Location received and logged')
    expect(spyUpsert).toHaveBeenCalled()
    expect(spyMsg).toHaveBeenCalled()

    spyUpsert.mockRestore()
    spyMsg.mockRestore()
  })
})
