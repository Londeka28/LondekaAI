# ZASDC-KZN Translation System

Helps learners understand South African Space Design Competition RFP documents and
space-settlement terminology in English, isiZulu, Afrikaans, or combinations, while keeping the
original English available. The official RFP is always the source of truth.

## Structure
- `frontend/`: static website published by Netlify
- `netlify/functions/api.mts`: deployed API for translation, uploads, and glossary operations
- `db/schema.ts`: Netlify Database schema
- `netlify/database/migrations/`: generated database migrations applied during deployment
- `backend/`: original Flask implementation retained for reference; not used by the Netlify deployment
- `tests/netlify-api.test.ts`: Netlify API checks

## Local setup
1. Run `npm ci`.
2. Run `netlify dev --port 8889` in a linked Netlify project.
3. Open http://localhost:8889. The frontend calls `/api` on the same origin.
4. Run `npm test` and `npm run check` for API tests and TypeScript validation.

## Deployment
Netlify publishes `frontend/` and bundles the TypeScript function using `netlify.toml`.
No frontend build command is required. Node dependencies are installed from `package-lock.json`.
The function routes `/api/health`, `/api/translate`, `/api/upload-translate`,
`/api/glossary/search`, and `/api/glossary/suggest` replace the Flask service.

Translations use `gpt-4.1-mini` through Netlify AI Gateway with automatically supplied runtime credentials.
No separate translation provider key or external Flask host is required. Translation requests consume Netlify AI credits.
Uploads support TXT, text-based PDF, and DOCX, up to 4 MB and 12,000 extracted characters per request.
Scanned PDFs require OCR before upload. Uploaded documents are processed per request and are not stored.

Glossary records and pending learner suggestions use Netlify Database through Drizzle ORM.
The database starts empty; search returns only terms with `status = 'approved'`.
Review and approval require database administration; this deployment does not include an admin interface.
After changing `db/schema.ts`, generate a migration with
`npx drizzle-kit generate --name describe_schema_change`. Netlify applies migrations during deployment.

`/api/health` confirms that the API is reachable; it does not test AI or database availability.
The legacy Python tests apply only to the original Flask code.
Explanations, illustrations, and analytics remain future phases.

## Security rules
Keep credentials server-side. Never commit secrets or put credentials in browser code.
The official RFP remains the source of truth; AI translations are a learning aid and may contain errors.

## Build phases
1 Foundation (this) · 2 Translation · 3 Reader and extraction · 4 Glossary · 5 AI explanations ·
6 Illustrations · 7 Analytics and feedback · 8 Testing and handover
