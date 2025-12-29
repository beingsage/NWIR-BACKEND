import express from 'express'

const router = express.Router()

/* eslint-disable @typescript-eslint/no-var-requires */
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../docs/openapi.json')

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }))

export default router
