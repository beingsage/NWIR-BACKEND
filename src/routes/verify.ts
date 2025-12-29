import express from 'express'
import { requireAuth } from '../middleware/auth'
import { verifyWorker } from '../controllers/verifyController'

const router = express.Router()

router.post('/', requireAuth, verifyWorker)

export default router
