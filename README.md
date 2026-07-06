# AZ-900 Bites

A reels-style micro-learning app for people preparing for the Microsoft
AZ-900 (Azure Fundamentals) exam. Pick a module and short knowledge cards
arrive one after another with vertical swipes. Each card explains a single
concept in 2-3 sentences, narrated by different personas, and carries a
mini quiz underneath.

## Architecture

- **frontend/** — Expo (React Native + TypeScript). Runs on your phone with Expo Go.
- **backend/** — FastAPI + SQLite. Serves the cards via `GET /cards`.
- **backend/prompts/** — Persona system prompts (`klasik_hoca`, `analoji_ustasi`,
  `kisa_kesen`). Adding a new `.md` file there means adding a new persona.
- **backend/scripts/generate_cards.py** — Generates cards with Claude (Anthropic API).

## Setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Generate cards (with an Anthropic API key):
#   echo "ANTHROPIC_API_KEY=sk-..." > .env
python -m scripts.generate_cards
# or without an API key, using the bundled seed cards:
python -m scripts.generate_cards --offline

# Start the API (0.0.0.0 so your phone can reach it):
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Scan the QR code with **Expo Go** on your phone. The phone and the computer
must be on the same Wi-Fi; the frontend derives the API address automatically
from the Expo dev server IP.

## API

- `GET /health` — health check
- `GET /modules` — modules and their card counts
- `GET /cards?module=Cloud%20Concepts&persona=analoji_ustasi` — list cards
  (both filters are optional)

## Data model

`cards`: id, module, topic, persona, content, quiz_question, quiz_answer,
`audio_url` (reserved for the Level 2 TTS integration, empty for now),
created_at.

## Roadmap

- [x] MVP: Cloud Concepts cards + vertical swipe + quiz
- [ ] Remaining modules (Architecture & Management, Pricing & Support)
- [ ] Level 2: audio cards via TTS (`audio_url`)
