# NWIR Backend (Admin Panel)

Development & testing notes

-- To initialize DB collections locally (requires MONGO_URI):
	- npm run migrate
-- To seed minimal test data (requires MONGO_URI):
	- npm run seed
- Tests: jest is configured via `jest.config.cjs`. Run `npm test`.

If CI fails to run tests due to missing packages in your environment, ensure `npm ci` succeeds (registry/network access) before re-running tests.

# NWIR Backend (Minimal scaffold)

This is a small TypeScript Express scaffold intended as a local/development backend for the NWIR frontend.

Quick start

1. cd backend
2. npm install
3. copy `.env.example` to `.env` and set `JWT_SECRET`
4. npm run dev

APIs

- POST /api/auth/register { name, email, password, role? } => { user, token }
- POST /api/auth/login { email, password } => { user, token }
- GET /api/users (protected)
- GET /api/users/:id (protected)
- PUT /api/users/:id (protected)
- POST /api/verify (protected) { workerId } => simulated verification result

Notes

- Data is persisted to MongoDB when `MONGO_URI` is provided (recommended for dev/staging).
- Replace with a production-grade DB setup and robust auth in production.
