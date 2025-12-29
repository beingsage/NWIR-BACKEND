import express from 'express'
import { mockCall, mockSms } from '../controllers/devController'

const router = express.Router()

router.post('/mock-call', mockCall)
router.post('/mock-sms', mockSms)

export default router
