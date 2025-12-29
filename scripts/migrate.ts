import { initDb } from '../src/db/index'

async function run() {
  process.env.DB_AUTO_MIGRATE = '1'
  try {
    await initDb()
    console.log('MongoDB initialization complete (if MONGO_URI set).')
  } catch (e) {
    console.error('Migration failed:', e)
    process.exit(1)
  }
}

run()
