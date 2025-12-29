import express from 'express'
import controller from '../controllers/whatsappController'

const router = express.Router()

router.get('/', controller.verify)
router.post('/', controller.handleMessage)

export default router
