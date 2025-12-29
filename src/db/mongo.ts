import { MongoClient, Db } from 'mongodb'
import { v4 as uuid } from 'uuid'

const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
  // Do not throw at import time for tests; only throw if used without config
  // throw new Error('MONGO_URI is required for MongoDB adapter')
}

let client: MongoClient | null = null
let db: Db | null = null

export async function connect() {
  if (!MONGO_URI) return null
  if (!client) {
    client = new MongoClient(MONGO_URI)
    await client.connect()
    db = client.db()
  }
  return db
}

export async function initDb() {
  const database = await connect()
  if (!database) return

  // Ensure indexes
  await database.collection('users').createIndex({ email: 1 }, { unique: true })
  await database.collection('employers').createIndex({ employer_id: 1 }, { unique: true })
  await database.collection('verifications').createIndex({ worker_id: 1 })
  await database.collection('audit_logs').createIndex({ timestamp: -1 })
  await database.collection('call_histories').createIndex({ phone: 1 })
  await database.collection('call_histories').createIndex({ timestamp: -1 })
  await database.collection('whatsapp_messages').createIndex({ phone: 1 })
  await database.collection('whatsapp_messages').createIndex({ timestamp: -1 })
  await database.collection('whatsapp_contacts').createIndex({ phone: 1 }, { unique: true })
}

export async function createCallHistory({ phone, inferredLocation, timestamp = new Date() }: any) {
  const database = await connect()
  if (!database) throw new Error('No MongoDB connection')
  const doc = { phone, inferred_location: inferredLocation, timestamp }
  await database.collection('call_histories').insertOne(doc)
  return doc
}

export async function findLastCallByPhone(phone: string) {
  const database = await connect()
  if (!database) return null
  return database.collection('call_histories').find({ phone }).sort({ timestamp: -1 }).limit(1).next()
}

// Generic call log (stores raw Twilio webhook data for auditing)
export async function createCallLog({ phone, to, callSid, direction = 'inbound', body, timestamp = new Date() }: any) {
  const database = await connect()
  if (!database) throw new Error('No MongoDB connection')
  const doc = { phone, to, call_sid: callSid, direction, body: body || null, timestamp }
  await database.collection('call_logs').insertOne(doc)
  return doc
}

// WhatsApp helpers
export async function createWhatsappMessage({ phone, type, content, timestamp = new Date() }: any) {
  const database = await connect()
  if (!database) throw new Error('No MongoDB connection')
  const doc = { phone, type, content, timestamp }
  await database.collection('whatsapp_messages').insertOne(doc)
  return doc
}

export async function upsertWhatsappContact({ phone, name, lastLocation, updatedAt = new Date() }: any) {
  const database = await connect()
  if (!database) throw new Error('No MongoDB connection')
  const update: any = { phone, name: name || null, updated_at: updatedAt }
  if (lastLocation) update.last_location = lastLocation
  await database.collection('whatsapp_contacts').updateOne({ phone }, { $set: update }, { upsert: true })
  return database.collection('whatsapp_contacts').findOne({ phone })
}

export async function findWhatsappContactByPhone(phone: string) {
  const database = await connect()
  if (!database) return null
  return database.collection('whatsapp_contacts').findOne({ phone })
}

export async function createIncident({ id = uuid(), workerId, status = 'open', createdAt = new Date(), details = {} }: any) {
  const database = await connect()
  if (!database) throw new Error('No MongoDB connection')
  const doc = { id, worker_id: workerId, status, details, created_at: createdAt }
  await database.collection('incidents').insertOne(doc)
  return doc
}

export async function findOpenIncidentByWorkerId(workerId: string) {
  const database = await connect()
  if (!database) return null
  return database.collection('incidents').findOne({ worker_id: workerId, status: 'open' })
}

export async function updateIncident(id: string, update: any) {
  const database = await connect()
  if (!database) throw new Error('No MongoDB connection')
  await database.collection('incidents').updateOne({ id }, { $set: update })
  return database.collection('incidents').findOne({ id })
}

// Users
export async function createUser({ id = uuid(), name, email, passwordHash, role = 'worker' }: any) {
  const database = await connect()
  if (!database) throw new Error('No MongoDB connection')
  const doc = { id, name, email, password_hash: passwordHash, role, created_at: new Date() }
  const r = await database.collection('users').insertOne(doc)
  return { ...doc }
}

export async function findUserByEmail(email: string) {
  const database = await connect()
  if (!database) return null
  return database.collection('users').findOne({ email })
}

export async function findUserById(id: string) {
  const database = await connect()
  if (!database) return null
  return database.collection('users').findOne({ id })
}

export async function updateUser(u: any) {
  const database = await connect()
  if (!database) return null
  await database.collection('users').updateOne({ id: u.id }, { $set: { name: u.name, email: u.email, role: u.role, updated_at: new Date() } })
  return database.collection('users').findOne({ id: u.id })
}

export async function listUsers() {
  const database = await connect()
  if (!database) return []
  return database.collection('users').find().sort({ created_at: -1 }).toArray()
}

export async function listWorkers() {
  const database = await connect()
  if (!database) return []
  return database.collection('users').find({ role: 'worker' }).sort({ created_at: -1 }).toArray()
}

// Verifications
export async function createVerification({ id = uuid(), workerId, result }: any) {
  const database = await connect()
  if (!database) throw new Error('No MongoDB connection')
  const doc = { id, worker_id: workerId, result, created_at: new Date() }
  await database.collection('verifications').insertOne(doc)
  return doc
}

export async function listVerifications(_filter: any = {}) {
  const database = await connect()
  if (!database) return []
  return database.collection('verifications').find().sort({ created_at: -1 }).limit(100).toArray()
}

export async function safeList(collectionName: string) {
  const database = await connect()
  if (!database) return []
  try {
    return await database.collection(collectionName).find().limit(100).toArray()
  } catch (e) {
    return []
  }
}

// Contracts
export async function getAllContracts(filters: { workerId?: string; employerId?: string; status?: string } = {}) {
  const database = await connect()
  if (!database) return []
  const q: any = {}
  if (filters.workerId) q.worker_id = filters.workerId
  if (filters.employerId) q.employer_id = filters.employerId
  if (filters.status) q.status = filters.status
  return database.collection('contracts').find(q).toArray()
}

export async function getDevicesByWorkerId(workerId: string) {
  const database = await connect()
  if (!database) return []
  return database.collection('devices').find({ worker_id: workerId }).toArray()
}

export async function getAllTasks(filters: { workerId?: string; employerId?: string } = {}) {
  const database = await connect()
  if (!database) return []
  const q: any = {}
  if (filters.workerId) q.worker_id = filters.workerId
  if (filters.employerId) q.employer_id = filters.employerId
  return database.collection('tasks').find(q).toArray()
}

export async function getAllIncidents(filters: { workerId?: string; status?: string } = {}) {
  const database = await connect()
  if (!database) return []
  const q: any = {}
  if (filters.workerId) q.worker_id = filters.workerId
  if (filters.status) q.status = filters.status
  return database.collection('incidents').find(q).toArray()
}

export async function getEmployerById(employerId: string) {
  const database = await connect()
  if (!database) return null
  return database.collection('employers').findOne({ employer_id: employerId })
}

export async function createAuditLog(logData: any) {
  const database = await connect()
  if (!database) return null
  const id = uuid()
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
  }
  await database.collection('audit_logs').insertOne(doc)
  return doc
}

export async function close() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}
