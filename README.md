# WWWN - "I Like / I Wish" Retrospective Board

Real-time feedback collection tool for live sessions.

## Setup

### Prerequisites
- Node.js 18+
- Firebase/Firestore project
- Service account key JSON

### Installation

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### Configuration

1. Copy `.env.example` to `.env`
2. Add Firebase service account key to `server/serviceAccountKey.json`
3. Update environment variables

### Development

```bash
# Start backend
cd server && npm run dev

# Start frontend (new terminal)
cd client && npm run dev
```

## Architecture

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + SSE
- Database: Firestore with TTL
- Real-time: Server-Sent Events
