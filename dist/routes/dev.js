"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const devController_1 = require("../controllers/devController");
const router = express_1.default.Router();
router.post('/mock-call', devController_1.mockCall);
router.post('/mock-sms', devController_1.mockSms);
exports.default = router;
