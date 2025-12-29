import express from 'express'
// Load environment from .env in development
import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import helmet from 'helmet'
import type { Request, Response } from 'express'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import verifyRoutes from './routes/verify'
import publicRoutes from './routes/public'
import callRoutes from './routes/call'
import devRoutes from './routes/dev'
import whatsappRoutes from './routes/whatsapp'
import swaggerRoutes from './routes/swagger'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/verify', verifyRoutes)
app.use('/api', publicRoutes)
app.use('/twilio', callRoutes)
app.use('/dev', devRoutes)
app.use('/whatsapp', whatsappRoutes)
app.use('/docs', swaggerRoutes)

const PORT = process.env.PORT ?? 4000

async function start() {
  try {
    // Initialize DB (runs migrations if DB_AUTO_MIGRATE is set)
    await import('./repo/db').then((m) => m.initDb && m.initDb())
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('DB not initialized:', (e as Error).message)
  }

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on http://localhost:${PORT}`)
    })
  }
}

start()

export default app
