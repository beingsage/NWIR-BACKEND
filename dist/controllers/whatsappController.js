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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = verify;
exports.handleMessage = handleMessage;
const db = __importStar(require("../db/mongo"));
// Verify endpoint (GET) and webhook receiver (POST)
async function verify(req, res) {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    res.sendStatus(403);
}
async function handleMessage(req, res) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    try {
        const entry = (_a = req.body.entry) === null || _a === void 0 ? void 0 : _a[0];
        const changes = (_b = entry === null || entry === void 0 ? void 0 : entry.changes) === null || _b === void 0 ? void 0 : _b[0];
        const message = (_d = (_c = changes === null || changes === void 0 ? void 0 : changes.value) === null || _c === void 0 ? void 0 : _c.messages) === null || _d === void 0 ? void 0 : _d[0];
        if (!message)
            return res.sendStatus(200);
        const phone = message.from;
        const name = (_h = (_g = (_f = (_e = changes === null || changes === void 0 ? void 0 : changes.value) === null || _e === void 0 ? void 0 : _e.contacts) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.profile) === null || _h === void 0 ? void 0 : _h.name;
        const type = message.type;
        // Upsert contact and store message (don't let DB failures break webhook)
        try {
            if (type === 'location') {
                const loc = { lat: message.location.latitude, lng: message.location.longitude };
                await db.upsertWhatsappContact({ phone, name, lastLocation: loc, updatedAt: new Date() });
            }
            else {
                await db.upsertWhatsappContact({ phone, name, updatedAt: new Date() });
            }
            await db.createWhatsappMessage({ phone, type, content: message, timestamp: new Date() });
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Failed to save WhatsApp data:', e.message);
        }
        // Simple command flow: SOS -> create incident
        if (type === 'text') {
            const text = ((_m = (_l = (_k = (_j = message.text) === null || _j === void 0 ? void 0 : _j.body) === null || _k === void 0 ? void 0 : _k.trim()) === null || _l === void 0 ? void 0 : _l.toUpperCase) === null || _m === void 0 ? void 0 : _m.call(_l)) || '';
            if (text === 'SOS') {
                await db.createIncident({ workerId: phone, status: 'open', details: { via: 'whatsapp' } });
            }
        }
        return res.sendStatus(200);
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('WhatsApp webhook error', err);
        return res.sendStatus(500);
    }
}
exports.default = { handleMessage, verify };
