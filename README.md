# Bloom Hotel OS – Django + React Setup

This repository now bundles the existing Vite/React front-end with a lightweight Django
project so you can run the hotel management experience locally with a Python backend.

## Prerequisites

- Node.js 18+
- Python 3.11+
- A virtual environment tool of your choice (`venv`, `conda`, etc.)

## 1. Install front-end dependencies and build the React app

```bash
npm install
npm run build
```

The build step produces hashed assets inside `dist/` that Django will serve.

## 2. Create a Python virtual environment and install Django

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Apply database migrations (SQLite by default)

```bash
python backend/manage.py migrate
```

## 4. Run the Django development server

```bash
python backend/manage.py runserver
```

Visit <http://127.0.0.1:8000> to browse the compiled React single-page application
served by Django. Any unknown route is routed back to the SPA so client-side
navigation continues to work.

## Development tips

- Whenever you update the React code, re-run `npm run build` so the Django server
  serves the latest assets.
- Static files are exposed from `dist/assets/` via Django’s static files system.
- You can enable Django debug mode by exporting `DJANGO_DEBUG=false` for production-like
  behaviour or tweaking other settings via environment variables.
