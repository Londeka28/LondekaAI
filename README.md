# ZASDC-KZN Translation System

Helps learners understand South African Space Design Competition RFP documents and
space-settlement terminology in English, isiZulu, Afrikaans, or combinations, while keeping the
original English available. The official RFP is always the source of truth.

## Structure
- `frontend/` static HTML/CSS/JS (deploy to Vercel)
- `backend/` Flask API (deploy to Render)
- `supabase/migrations/` database tables and access policies
- `tests/` automated tests and safe sample fixtures

## Local setup
1. `python -m venv .venv` then activate it (Windows: `.venv\Scripts\activate`)
2. `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and add real keys. Never commit `.env`.
4. Run the API: `python backend/app.py` and check http://localhost:5000/api/health
5. Serve the frontend: `cd frontend && python -m http.server 5500`
6. Run tests: `pytest`

## Deployment
- **Vercel:** deploy the `frontend/` directory; set `window.ZASDC_API_BASE` to the Render URL.
- **Render:** Python web service. Build: `pip install -r requirements.txt`.
  Start: `gunicorn --chdir backend app:app`. Set secrets and `ALLOWED_ORIGIN` (the Vercel URL) in Render's environment settings.
- **Supabase:** run migrations; use the service key server-side only.

## Security rules
Secrets live only in `.env` locally and in Render's environment settings. Never put real keys in
GitHub, screenshots or reports. Do not store full RFP text in analytics.

## Build phases
1 Foundation (this) · 2 Translation · 3 Reader and extraction · 4 Glossary · 5 AI explanations ·
6 Illustrations · 7 Analytics and feedback · 8 Testing and handover
