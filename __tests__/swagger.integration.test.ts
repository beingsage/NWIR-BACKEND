import request from 'supertest'
import app from '../src/index'

describe('Swagger docs', () => {
  test('GET /docs/ serves HTML UI', async () => {
    const res = await request(app).get('/docs/')
    expect(res.status).toBe(200)
    expect(res.type).toContain('html')
    expect(res.text).toContain('Swagger UI')
  })

  test('OpenAPI JSON is reachable', async () => {
    const res = await request(app).get('/docs/swagger-ui-init.js')
    // This endpoint is internal to swagger-ui and should exist; we assert 200
    expect(res.status).toBe(200)
  })
})
