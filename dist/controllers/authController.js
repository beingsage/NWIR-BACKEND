"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const db_1 = require("../repo/db");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const registerSchema = zod_1.z.object({ name: zod_1.z.string().min(1), email: zod_1.z.string().email(), password: zod_1.z.string().min(6), role: zod_1.z.string().optional() });
const loginSchema = zod_1.z.object({ email: zod_1.z.string().email(), password: zod_1.z.string().min(6) });
async function register(req, res) {
    var _a;
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success)
        return (0, response_1.err)(res, 400, parsed.error.errors);
    const existing = await (0, db_1.findUserByEmail)(parsed.data.email);
    if (existing)
        return (0, response_1.err)(res, 409, 'Email already exists');
    const pwHash = await (0, hash_1.hashPassword)(parsed.data.password);
    const user = {
        id: (0, uuid_1.v4)(),
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: pwHash,
        role: (_a = parsed.data.role) !== null && _a !== void 0 ? _a : 'worker',
        createdAt: new Date().toISOString(),
    };
    await (0, db_1.addUser)(user);
    const token = (0, jwt_1.signUser)(user);
    return (0, response_1.ok)(res, { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token }, 201);
}
async function login(req, res) {
    var _a, _b;
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
        return (0, response_1.err)(res, 400, parsed.error.errors);
    const user = await (0, db_1.findUserByEmail)(parsed.data.email);
    if (!user)
        return (0, response_1.err)(res, 401, 'Invalid credentials');
    // DB may store password as `password_hash` or `passwordHash` depending on adapter
    const passHash = (_b = (_a = user.passwordHash) !== null && _a !== void 0 ? _a : user.password_hash) !== null && _b !== void 0 ? _b : '';
    const valid = await (0, hash_1.verifyPassword)(parsed.data.password, passHash);
    if (!valid)
        return (0, response_1.err)(res, 401, 'Invalid credentials');
    const token = (0, jwt_1.signUser)({ id: user.id, email: user.email, role: user.role });
    return (0, response_1.ok)(res, { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
}
async function logout(_req, res) {
    // Stateless JWT logout: client should remove token. Optionally record audit.
    return (0, response_1.ok)(res, { loggedOut: true });
}
