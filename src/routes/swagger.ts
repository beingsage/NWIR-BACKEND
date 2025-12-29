import express from 'express'
import path from 'path'

const router = express.Router()

/* eslint-disable @typescript-eslint/no-var-requires */
const swaggerUi = require('swagger-ui-express')

let swaggerDocument: any
try {
	// Resolve spec relative to compiled file (dist) and source (src)
	const specPath = path.resolve(__dirname, '../docs/openapi.json')
	// Use require so JSON is parsed synchronously
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	swaggerDocument = require(specPath)
} catch (e) {
	// If the compiled spec doesn't exist (e.g., not copied during build), fall back to a minimal doc
	// eslint-disable-next-line no-console
	console.warn('Swagger spec not found at runtime, serving minimal spec instead.')
	swaggerDocument = { openapi: '3.0.0', info: { title: 'NWIR Backend (minimal)', version: '0.1.0' }, paths: {} }
}

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }))

export default router
