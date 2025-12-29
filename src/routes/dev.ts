import express from 'express'
import { mockCall, mockSms, sendMessage } from '../controllers/devController'

const router = express.Router()

router.post('/mock-call', mockCall)
router.post('/mock-sms', mockSms)
router.post('/send-message', sendMessage)

export default router
