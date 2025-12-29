import type { Request, Response } from 'express'
import { ok, err } from '../utils/response'
import { verifyWorker as runVerify, quickVerify } from '../lib/verification-engine'

export async function verifyWorker(req: Request, res: Response) {
  try {
    const body = req.body as any

    // Support both full verify and quick QR verify
    if (body.quick && body.workerId) {
      const q = await quickVerify(body.workerId)
      return ok(res, q)
    }

    const request = {
      workerId: body.workerId,
      qrCode: body.qrCode,
      method: (body.method as any) || 'qr_scan',
      verifierId: body.verifierId || 'system',
      verifierRole: (body.verifierRole as any) || 'employer',
      verifierName: body.verifierName,
      verifierOrganization: body.verifierOrganization,
      location: body.location,
      locationName: body.locationName,
      deviceInfo: body.deviceInfo,
    }

    const result = await runVerify(request)
    return ok(res, result)
  } catch (error) {
    console.error('Verification error:', error)
    return err(res, 500, 'Verification failed')
  }
}
