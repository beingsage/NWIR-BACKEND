import express from 'express'
import { requireAuth } from '../middleware/auth'
import { list, getOne, update } from '../controllers/userController'

const router = express.Router()

router.get('/', requireAuth, list)
router.get('/:id', requireAuth, getOne)
router.put('/:id', requireAuth, update)

export default router
