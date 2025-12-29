import express from 'express'
import { incomingCall, incomingSms } from '../controllers/callController'

const router = express.Router()

// Twilio webhooks
router.post('/incoming', incomingCall)
router.post('/sms', incomingSms)

export default router
