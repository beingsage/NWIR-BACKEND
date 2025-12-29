import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = auth.slice(7)
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid token' })
  // payload might be unknown shape; cast defensively
  req.user = (payload as any) as { id: string; email: string; role: string }
  next()
}
