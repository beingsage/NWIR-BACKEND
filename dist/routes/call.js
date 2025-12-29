"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const callController_1 = require("../controllers/callController");
const router = express_1.default.Router();
// Twilio webhooks
router.post('/incoming', callController_1.incomingCall);
router.post('/sms', callController_1.incomingSms);
exports.default = router;
