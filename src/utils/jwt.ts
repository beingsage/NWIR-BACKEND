import jwt from 'jsonwebtoken'
// import { User } from '../models/user' // Commenting out to loosen type

const SECRET = process.env.JWT_SECRET ?? 'change-me-in-prod'

// Accept a lightweight payload to avoid tight coupling with DB return types
export function signUser(u: { id: string; email: string; role?: string }) {
  return jwt.sign({ id: u.id, email: u.email, role: u.role }, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as unknown
  } catch {
    return null
  }
}
