import type { Request, Response } from 'express'
import { listUsers, listWorkers, findUserById, listVerifications } from '../repo/db'
import { ok } from '../utils/response'

export async function dashboardStats(_req: Request, res: Response) {
  const users = await listUsers()
  const totalWorkers = users.filter((u) => u.role === 'worker').length
  return ok(res, {
    totalWorkers,
    dailyVerifications: 89000,
    responseTime: '<300ms',
    uptime: '99.99%',
  })
}

export async function workers(_req: Request, res: Response) {
  const workers = await listWorkers()
  return ok(res, workers.map(({ password_hash, passwordHash, ...u }: any) => u))
}

export async function getWorker(req: Request, res: Response) {
  const id = req.params.id
  const u = await findUserById(id)
  if (!u) return ok(res, null)
  const { password_hash, passwordHash, ...rest } = u as any
  return ok(res, rest)
}

export async function incidents(_req: Request, res: Response) {
  return ok(res, [])
}

export async function employers(_req: Request, res: Response) {
  return ok(res, [])
}

export async function contracts(_req: Request, res: Response) {
  return ok(res, [])
}

export async function verifications(_req: Request, res: Response) {
  const v = await listVerifications()
  return ok(res, v)
}

export async function tasks(_req: Request, res: Response) {
  return ok(res, [])
}

export async function auditLogs(_req: Request, res: Response) {
  return ok(res, [])
}

export async function exportData(req: Request, res: Response) {
  const { type } = req.body as any
  // For now just return a dummy export URL
  return ok(res, { url: `/api/export/download/${type || 'data'}.json` })
}
