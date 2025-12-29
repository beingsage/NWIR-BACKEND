"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getOne = getOne;
exports.update = update;
const db_1 = require("../repo/db");
const response_1 = require("../utils/response");
async function list(req, res) {
    const users = await (0, db_1.listUsers)();
    // hide passwordHash
    return (0, response_1.ok)(res, users.map(({ passwordHash, ...u }) => u));
}
async function getOne(req, res) {
    var _a;
    const id = req.params.id;
    const u = await (0, db_1.findUserById)(id);
    if (!u)
        return (0, response_1.err)(res, 404, 'Not found');
    // hide passwordHash
    // DB may return `password_hash`; normalize before destructuring
    const userObj = { ...u, passwordHash: (_a = u.passwordHash) !== null && _a !== void 0 ? _a : u.password_hash };
    const { passwordHash, ...rest } = userObj;
    return (0, response_1.ok)(res, rest);
}
async function update(req, res) {
    const id = req.params.id;
    const u = await (0, db_1.findUserById)(id);
    if (!u)
        return (0, response_1.err)(res, 404, 'Not found');
    const merged = { ...u, ...req.body, updatedAt: new Date().toISOString() };
    await (0, db_1.updateUser)(merged);
    const { passwordHash, ...rest } = merged;
    return (0, response_1.ok)(res, rest);
}
