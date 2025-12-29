"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateIfRequested = migrateIfRequested;
exports.query = query;
// Postgres adapter is deprecated — migrations and DB code were migrated to MongoDB.
// This file remains for historical reasons. Do NOT use Postgres functions anymore.
function migrateIfRequested() {
    throw new Error('Postgres adapter removed. Use MongoDB (MONGO_URI) and run `npm run migrate`');
}
async function query() {
    throw new Error('Postgres adapter removed. Use MongoDB (MONGO_URI)');
}
