import { MongoClient } from 'mongodb'

const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
  console.error('MONGO_URI is required to run seed script')
  process.exit(1)
}

const client = new MongoClient(MONGO_URI)

async function seed() {
  await client.connect()
  const db = client.db()
  try {
    const userId = 'W-TEST-1'
    await db.collection('users').updateOne({ id: userId }, { $setOnInsert: { id: userId, name: 'Test Worker', email: 'worker@test.local', password_hash: 'testhash', role: 'worker', created_at: new Date() } }, { upsert: true })

    const empId = 'EMP-TEST-1'
    await db.collection('employers').updateOne({ employer_id: empId }, { $setOnInsert: { employer_id: empId, company_name: 'TestCo', trade_name: 'TestCo' } }, { upsert: true })

    const contractId = 'CONTRACT-TEST-1'
    await db.collection('contracts').updateOne({ id: contractId }, { $setOnInsert: { id: contractId, worker_id: userId, employer_id: empId, start_date: new Date(), status: 'active', type: 'delivery' } }, { upsert: true })

    console.log('Seed data added')
  } catch (e) {
    console.error('Seeding failed:', e)
    process.exit(1)
  } finally {
    await client.close()
  }
}

seed()
