/** Integration tests for /api/verify */
import request from 'supertest'

// Mock auth middleware to bypass token checks
jest.mock('../src/middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { id: 'tester', email: 'tester@example.com', role: 'employer' }
    next()
  },
}))

// Mock DB/repo functions used by verification engine
jest.mock('../src/repo/db', () => ({
  getWorkerById: async (workerId: string) => ({
    workerId,
    fullName: 'Test Worker',
    status: 'active',
    backgroundCheckStatus: 'passed',
    policeVerificationStatus: 'cleared',
    facialEmbeddingRef: true,
    trustScore: 85,
    photoUrl: '',
    createdAt: new Date().toISOString(),
    avgRating: 4.5,
  }),
  getAllContracts: async () => [ { status: 'active', employerId: 'E-1', startDate: new Date().toISOString(), type: 'delivery' } ],
  getDevicesByWorkerId: async () => [ { attestationStatus: 'verified', deviceModel: 'Pixel', lastSeen: new Date().toISOString() } ],
  getAllTasks: async () => [],
  getAllIncidents: async () => [],
  getEmployerById: async (id: string) => ({ companyName: 'TestCo', tradeName: 'TestCo' }),
  createVerification: async (data: any) => ({ ...data, requestId: 'VER-TEST', timestamp: new Date().toISOString() }),
  createAuditLog: async (data: any) => ({ id: 'LOG-1', ...data }),
}))

import app from '../src/index'

describe('POST /api/verify', () => {
  test('quick verification returns minimal result', async () => {
    const res = await request(app).post('/api/verify').send({ quick: true, workerId: 'W-1' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('valid')
  })

  test('full verification returns detailed response', async () => {
    const res = await request(app).post('/api/verify').send({ workerId: 'W-1', method: 'id_lookup' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('requestId')
    expect(res.body.data).toHaveProperty('trustScore')
  })
})
