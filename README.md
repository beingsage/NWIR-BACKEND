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

WhatsApp Integration
--------------------

This project includes a simple WhatsApp Cloud API webhook receiver to capture incoming messages and live location shares.

Environment variables:

- `WHATSAPP_VERIFY_TOKEN` — verification token for the GET webhook handshake (set this in Meta app webhook settings)
- `MONGO_URI` — to persist incoming messages/contacts to MongoDB (optional for tests, but required in production)

Endpoints:

- `GET /whatsapp` — webhook verification (Meta will call with `hub.verify_token` and `hub.challenge`)
- `POST /whatsapp` — incoming message webhook (stores contact and message; a text `SOS` will create an incident)

API Documentation
-----------------

A Swagger UI is available at `GET /docs` to explore and try API endpoints locally. It serves a minimal OpenAPI spec in `src/docs/openapi.json` and is intended for dev/testing purposes.

Twilio WhatsApp / SMS Integration
--------------------------------

Quick setup (WhatsApp sandbox) — development

1. Install ngrok (https://ngrok.com) and run: `ngrok http 4000`
2. In the Twilio Console → Messaging → Try it out → WhatsApp Sandbox (or Messaging Services if using a phone number), set the incoming webhook to:
	 - `https://<your-ngrok>.ngrok.io/twilio/sms` (method: POST)
3. Make sure the project `.env` contains:
	 - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (or `TWILIO_MESSAGING_SID` if using messaging service)
4. Start the server: `npm run dev`

How the flow works

- When a user sends `SOS` / `HELP` we:
	- Create an incident (status `open`) in MongoDB
	- Send an outbound WhatsApp message asking them to share live location (paperclip → Location → Share live location)
	- Log the outbound message to the `whatsapp_messages` collection with `type: 'outbound'`
- When Twilio posts an inbound message which includes `Latitude` and `Longitude`:
	- We upsert contact with lastLocation and save inbound message (type: `location`)
	- If there is an open incident for that phone, we update it to `location_received` and attach the coordinates
	- Send a confirmation reply to the user

Testing locally

- Use the dev endpoint to test outbound sends without hitting Twilio:
	- `POST /dev/send-message` with `{ "phone": "+1555...", "body": "Test outbound" }` (requires `TELECOM_MODE=MOCK`)
- After a flow runs, inspect MongoDB collections to verify logging:
	- `whatsapp_messages` — inbound/outbound messages
	- `whatsapp_contacts` — contact + last location
	- `incidents` — incident lifecycle and details

Advanced

- To observe delivery status, provide `statusCallback` in the Twilio send and create an endpoint to accept status webhooks — we can add this if you want delivery-level tracking.


Notes:

- The handler stores messages in `whatsapp_messages` and contacts in `whatsapp_contacts` collections.
- By default the webhook will not error when Mongo is not configured (useful for local tests/sandboxing).

