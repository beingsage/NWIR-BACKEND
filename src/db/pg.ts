// Postgres adapter is deprecated — migrations and DB code were migrated to MongoDB.
// This file remains for historical reasons. Do NOT use Postgres functions anymore.
export function migrateIfRequested() {
  throw new Error('Postgres adapter removed. Use MongoDB (MONGO_URI) and run `npm run migrate`')
}

export async function query() {
  throw new Error('Postgres adapter removed. Use MongoDB (MONGO_URI)')
}
