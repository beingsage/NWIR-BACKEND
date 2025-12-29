"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = connect;
exports.initDb = initDb;
exports.createUser = createUser;
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.updateUser = updateUser;
exports.listUsers = listUsers;
exports.listWorkers = listWorkers;
exports.createVerification = createVerification;
exports.listVerifications = listVerifications;
exports.safeList = safeList;
exports.getAllContracts = getAllContracts;
exports.getDevicesByWorkerId = getDevicesByWorkerId;
exports.getAllTasks = getAllTasks;
exports.getAllIncidents = getAllIncidents;
exports.getEmployerById = getEmployerById;
exports.createAuditLog = createAuditLog;
exports.close = close;
const mongodb_1 = require("mongodb");
const uuid_1 = require("uuid");
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    // Do not throw at import time for tests; only throw if used without config
    // throw new Error('MONGO_URI is required for MongoDB adapter')
}
let client = null;
let db = null;
async function connect() {
    if (!MONGO_URI)
        return null;
    if (!client) {
        client = new mongodb_1.MongoClient(MONGO_URI);
        await client.connect();
        db = client.db();
    }
    return db;
}
async function initDb() {
    const database = await connect();
    if (!database)
        return;
    // Ensure indexes
    await database.collection('users').createIndex({ email: 1 }, { unique: true });
    await database.collection('employers').createIndex({ employer_id: 1 }, { unique: true });
    await database.collection('verifications').createIndex({ worker_id: 1 });
    await database.collection('audit_logs').createIndex({ timestamp: -1 });
}
// Users
async function createUser({ id = (0, uuid_1.v4)(), name, email, passwordHash, role = 'worker' }) {
    const database = await connect();
    if (!database)
        throw new Error('No MongoDB connection');
    const doc = { id, name, email, password_hash: passwordHash, role, created_at: new Date() };
    const r = await database.collection('users').insertOne(doc);
    return { ...doc };
}
async function findUserByEmail(email) {
    const database = await connect();
    if (!database)
        return null;
    return database.collection('users').findOne({ email });
}
async function findUserById(id) {
    const database = await connect();
    if (!database)
        return null;
    return database.collection('users').findOne({ id });
}
async function updateUser(u) {
    const database = await connect();
    if (!database)
        return null;
    await database.collection('users').updateOne({ id: u.id }, { $set: { name: u.name, email: u.email, role: u.role, updated_at: new Date() } });
    return database.collection('users').findOne({ id: u.id });
}
async function listUsers() {
    const database = await connect();
    if (!database)
        return [];
    return database.collection('users').find().sort({ created_at: -1 }).toArray();
}
async function listWorkers() {
    const database = await connect();
    if (!database)
        return [];
    return database.collection('users').find({ role: 'worker' }).sort({ created_at: -1 }).toArray();
}
// Verifications
async function createVerification({ id = (0, uuid_1.v4)(), workerId, result }) {
    const database = await connect();
    if (!database)
        throw new Error('No MongoDB connection');
    const doc = { id, worker_id: workerId, result, created_at: new Date() };
    await database.collection('verifications').insertOne(doc);
    return doc;
}
async function listVerifications(_filter = {}) {
    const database = await connect();
    if (!database)
        return [];
    return database.collection('verifications').find().sort({ created_at: -1 }).limit(100).toArray();
}
async function safeList(collectionName) {
    const database = await connect();
    if (!database)
        return [];
    try {
        return await database.collection(collectionName).find().limit(100).toArray();
    }
    catch (e) {
        return [];
    }
}
// Contracts
async function getAllContracts(filters = {}) {
    const database = await connect();
    if (!database)
        return [];
    const q = {};
    if (filters.workerId)
        q.worker_id = filters.workerId;
    if (filters.employerId)
        q.employer_id = filters.employerId;
    if (filters.status)
        q.status = filters.status;
    return database.collection('contracts').find(q).toArray();
}
async function getDevicesByWorkerId(workerId) {
    const database = await connect();
    if (!database)
        return [];
    return database.collection('devices').find({ worker_id: workerId }).toArray();
}
async function getAllTasks(filters = {}) {
    const database = await connect();
    if (!database)
        return [];
    const q = {};
    if (filters.workerId)
        q.worker_id = filters.workerId;
    if (filters.employerId)
        q.employer_id = filters.employerId;
    return database.collection('tasks').find(q).toArray();
}
async function getAllIncidents(filters = {}) {
    const database = await connect();
    if (!database)
        return [];
    const q = {};
    if (filters.workerId)
        q.worker_id = filters.workerId;
    if (filters.status)
        q.status = filters.status;
    return database.collection('incidents').find(q).toArray();
}
async function getEmployerById(employerId) {
    const database = await connect();
    if (!database)
        return null;
    return database.collection('employers').findOne({ employer_id: employerId });
}
async function createAuditLog(logData) {
    const database = await connect();
    if (!database)
        return null;
    const id = (0, uuid_1.v4)();
    const doc = {
        id,
        actorId: logData.actorId,
        actorName: logData.actorName,
        actorRole: logData.actorRole,
        action: logData.action,
        resource: logData.resource,
        resourceId: logData.resourceId,
        details: logData.details || {},
        ipAddress: logData.ipAddress || null,
        userAgent: logData.userAgent || null,
        timestamp: new Date(),
    };
    await database.collection('audit_logs').insertOne(doc);
    return doc;
}
async function close() {
    if (client) {
        await client.close();
        client = null;
        db = null;
    }
}
