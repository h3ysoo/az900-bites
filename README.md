# AZ-900 Bites

Microsoft AZ-900 (Azure Fundamentals) sınavına hazırlananlar için "reels" tarzı
mikro-öğrenme uygulaması. Bir modül seçersin, kısa bilgi kartları dikey swipe
ile arka arkaya gelir. Her kart tek bir kavramı 2-3 cümlede, farklı anlatıcı
personalarıyla anlatır ve altında mini bir quiz taşır.

## Mimari

- **frontend/** — Expo (React Native + TypeScript). Telefonda Expo Go ile çalışır.
- **backend/** — FastAPI + SQLite. Kartları `GET /cards` ile sunar.
- **backend/prompts/** — Persona sistem promptları (`klasik_hoca`, `analoji_ustasi`,
  `kisa_kesen`). Yeni bir `.md` dosyası eklemek yeni persona eklemek demektir.
- **backend/scripts/generate_cards.py** — Claude (Anthropic API) ile kart üretir.

## Kurulum

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Kartları üret (Anthropic API anahtarıyla):
#   echo "ANTHROPIC_API_KEY=sk-..." > .env
python -m scripts.generate_cards
# veya API anahtarı olmadan hazır tohum kartlarla:
python -m scripts.generate_cards --offline

# API'yi başlat (telefonun erişebilmesi için 0.0.0.0):
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Telefonda **Expo Go** ile QR kodu okut. Telefonun ve bilgisayarın aynı Wi-Fi'da
olması gerekir; frontend, API adresini Expo'nun dev sunucu IP'sinden otomatik
türetir.

## API

- `GET /health` — sağlık kontrolü
- `GET /modules` — modüller ve kart sayıları
- `GET /cards?module=Cloud%20Concepts&persona=analoji_ustasi` — kart listesi
  (iki filtre de opsiyonel)

## Veri modeli

`cards`: id, module, topic, persona, content, quiz_question, quiz_answer,
`audio_url` (Seviye 2 TTS entegrasyonu için rezerve, şimdilik boş), created_at.

## Yol haritası

- [x] MVP: Cloud Concepts kartları + dikey swipe + quiz
- [ ] Diğer modüller (Architecture & Management, Pricing & Support)
- [ ] Seviye 2: TTS ile sesli kartlar (`audio_url`)
