"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incomingCall = incomingCall;
exports.incomingSms = incomingSms;
const twilio_1 = __importDefault(require("twilio"));
const VoiceResponse = twilio_1.default.twiml.VoiceResponse;
const MessagingResponse = twilio_1.default.twiml.MessagingResponse;
const locationEngine_1 = require("../services/locationEngine");
async function incomingCall(req, res) {
    const from = req.body.From;
    const to = req.body.To;
    const callSid = req.body.CallSid;
    // Immediately reject the call to minimize time on call (cheaper than answering)
    const twiml = new VoiceResponse();
    twiml.reject({ reason: 'busy' });
    (async () => {
        try {
            const db = await Promise.resolve().then(() => __importStar(require('../repo/db')));
            if (db && db.createCallLog) {
                await db.createCallLog({ phone: from, to, callSid, direction: 'call' });
            }
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Failed to save call log:', e.message);
        }
    })();
    res.type('text/xml');
    res.send(twiml.toString());
}
async function incomingSms(req, res) {
    const from = req.body.From;
    const body = req.body.Body;
    const inference = await (0, locationEngine_1.inferLocation)({ phone: from, text: body });
    (async () => {
        try {
            const db = await Promise.resolve().then(() => __importStar(require('../repo/db')));
            if (db && db.createCallLog) {
                await db.createCallLog({ phone: from, to: req.body.To, callSid: req.body.MessageSid, direction: 'sms', body });
            }
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Failed to save sms log:', e.message);
        }
    })();
    const msg = new MessagingResponse();
    msg.message(`Estimated: ${inference.estimated_location}. Confidence: ${Math.round(inference.confidence * 100)}%. Sources: ${Object.keys(inference.sources).join(', ')}`);
    res.type('text/xml');
    res.send(msg.toString());
}
