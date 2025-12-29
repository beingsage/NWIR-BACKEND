import type { Request, Response } from 'express'
import { listUsers, findUserById, updateUser } from '../repo/db'
import { ok, err } from '../utils/response'

export async function list(req: Request, res: Response) {
  const users = await listUsers()
  // hide passwordHash
  return ok(res, users.map(({ passwordHash, ...u }) => u))
}

export async function getOne(req: Request, res: Response) {
  const id = req.params.id
  const u = await findUserById(id)
  if (!u) return err(res, 404, 'Not found')
  // hide passwordHash
  // DB may return `password_hash`; normalize before destructuring
  const userObj: any = { ...(u as any), passwordHash: (u as any).passwordHash ?? (u as any).password_hash }
  const { passwordHash, ...rest } = userObj
  return ok(res, rest)
}

export async function update(req: Request, res: Response) {
  const id = req.params.id
  const u = await findUserById(id)
  if (!u) return err(res, 404, 'Not found')
  const merged = { ...u, ...req.body, updatedAt: new Date().toISOString() }
  await updateUser(merged)
  const { passwordHash, ...rest } = merged as any
  return ok(res, rest)
}
