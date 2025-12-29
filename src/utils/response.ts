import type { Response } from 'express'

export function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data })
}

export function err(res: Response, status = 400, error: unknown = 'Bad Request') {
  return res.status(status).json({ success: false, error })
}
