"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardStats = dashboardStats;
exports.workers = workers;
exports.getWorker = getWorker;
exports.incidents = incidents;
exports.employers = employers;
exports.contracts = contracts;
exports.verifications = verifications;
exports.tasks = tasks;
exports.auditLogs = auditLogs;
exports.exportData = exportData;
const db_1 = require("../repo/db");
const response_1 = require("../utils/response");
async function dashboardStats(_req, res) {
    const users = await (0, db_1.listUsers)();
    const totalWorkers = users.filter((u) => u.role === 'worker').length;
    return (0, response_1.ok)(res, {
        totalWorkers,
        dailyVerifications: 89000,
        responseTime: '<300ms',
        uptime: '99.99%',
    });
}
async function workers(_req, res) {
    const workers = await (0, db_1.listWorkers)();
    return (0, response_1.ok)(res, workers.map(({ password_hash, passwordHash, ...u }) => u));
}
async function getWorker(req, res) {
    const id = req.params.id;
    const u = await (0, db_1.findUserById)(id);
    if (!u)
        return (0, response_1.ok)(res, null);
    const { password_hash, passwordHash, ...rest } = u;
    return (0, response_1.ok)(res, rest);
}
async function incidents(_req, res) {
    return (0, response_1.ok)(res, []);
}
async function employers(_req, res) {
    return (0, response_1.ok)(res, []);
}
async function contracts(_req, res) {
    return (0, response_1.ok)(res, []);
}
async function verifications(_req, res) {
    const v = await (0, db_1.listVerifications)();
    return (0, response_1.ok)(res, v);
}
async function tasks(_req, res) {
    return (0, response_1.ok)(res, []);
}
async function auditLogs(_req, res) {
    return (0, response_1.ok)(res, []);
}
async function exportData(req, res) {
    const { type } = req.body;
    // For now just return a dummy export URL
    return (0, response_1.ok)(res, { url: `/api/export/download/${type || 'data'}.json` });
}
