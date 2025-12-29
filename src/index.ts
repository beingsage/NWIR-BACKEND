import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import type { Request, Response } from 'express'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import verifyRoutes from './routes/verify'
import publicRoutes from './routes/public'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/verify', verifyRoutes)
app.use('/api', publicRoutes)

const PORT = process.env.PORT ?? 4000

async function start() {
  try {
    // Initialize DB (runs migrations if DB_AUTO_MIGRATE is set)
    await import('./repo/db').then((m) => m.initDb && m.initDb())
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('DB not initialized:', (e as Error).message)
  }

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://localhost:${PORT}`)
  })
}

start()

export default app
