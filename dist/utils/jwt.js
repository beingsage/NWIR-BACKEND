"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUser = signUser;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import { User } from '../models/user' // Commenting out to loosen type
const SECRET = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : 'change-me-in-prod';
// Accept a lightweight payload to avoid tight coupling with DB return types
function signUser(u) {
    return jsonwebtoken_1.default.sign({ id: u.id, email: u.email, role: u.role }, SECRET, { expiresIn: '7d' });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, SECRET);
    }
    catch {
        return null;
    }
}
