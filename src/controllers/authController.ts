import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import type { Request, Response } from 'express'
import { addUser, findUserByEmail } from '../repo/db'
import { hashPassword, verifyPassword } from '../utils/hash'
import { signUser } from '../utils/jwt'
import { ok, err } from '../utils/response'

const registerSchema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(6), role: z.string().optional() })
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) })

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return err(res, 400, parsed.error.errors)

  const existing = await findUserByEmail(parsed.data.email)
  if (existing) return err(res, 409, 'Email already exists')

  const pwHash = await hashPassword(parsed.data.password)
  const user = {
    id: uuid(),
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: pwHash,
    role: (parsed.data.role as any) ?? 'worker',
    createdAt: new Date().toISOString(),
  }

  await addUser(user)
  const token = signUser(user)
  return ok(res, { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token }, 201)
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return err(res, 400, parsed.error.errors)

  const user = await findUserByEmail(parsed.data.email)
  if (!user) return err(res, 401, 'Invalid credentials')

  // DB may store password as `password_hash` or `passwordHash` depending on adapter
  const passHash = (user as any).passwordHash ?? (user as any).password_hash ?? ''
  const valid = await verifyPassword(parsed.data.password, passHash)
  if (!valid) return err(res, 401, 'Invalid credentials')

  const token = signUser({ id: (user as any).id, email: (user as any).email, role: (user as any).role })
  return ok(res, { user: { id: (user as any).id, name: (user as any).name, email: (user as any).email, role: (user as any).role }, token })
}

export async function logout(_req: Request, res: Response) {
  // Stateless JWT logout: client should remove token. Optionally record audit.
  return ok(res, { loggedOut: true })
}
