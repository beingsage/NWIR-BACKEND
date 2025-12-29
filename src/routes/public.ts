import express from 'express'
import * as ctl from '../controllers/publicController'

const router = express.Router()

router.get('/dashboard/stats', ctl.dashboardStats)
router.get('/workers', ctl.workers)
router.get('/workers/:id', ctl.getWorker)
router.get('/incidents', ctl.incidents)
router.get('/employers', ctl.employers)
router.get('/contracts', ctl.contracts)
router.get('/verifications', ctl.verifications)
router.get('/tasks', ctl.tasks)
router.get('/audit-logs', ctl.auditLogs)
router.post('/export', ctl.exportData)

export default router
