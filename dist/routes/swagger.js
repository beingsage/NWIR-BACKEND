"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
/* eslint-disable @typescript-eslint/no-var-requires */
const swaggerUi = require('swagger-ui-express');
let swaggerDocument;
try {
    // Resolve spec relative to compiled file (dist) and source (src)
    const specPath = path_1.default.resolve(__dirname, '../docs/openapi.json');
    // Use require so JSON is parsed synchronously
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    swaggerDocument = require(specPath);
}
catch (e) {
    // If the compiled spec doesn't exist (e.g., not copied during build), fall back to a minimal doc
    // eslint-disable-next-line no-console
    console.warn('Swagger spec not found at runtime, serving minimal spec instead.');
    swaggerDocument = { openapi: '3.0.0', info: { title: 'NWIR Backend (minimal)', version: '0.1.0' }, paths: {} };
}
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
exports.default = router;
