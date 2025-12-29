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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const verify_1 = __importDefault(require("./routes/verify"));
const public_1 = __importDefault(require("./routes/public"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/verify', verify_1.default);
app.use('/api', public_1.default);
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4000;
async function start() {
    try {
        // Initialize DB (runs migrations if DB_AUTO_MIGRATE is set)
        await Promise.resolve().then(() => __importStar(require('./repo/db'))).then((m) => m.initDb && m.initDb());
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.warn('DB not initialized:', e.message);
    }
    app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Backend running on http://localhost:${PORT}`);
    });
}
start();
exports.default = app;
