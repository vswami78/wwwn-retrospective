# WWWN - "I Like / I Wish" Retrospective Board

Real-time feedback collection tool for live retrospective sessions.

## Features

- **Frictionless**: No login required, just share a link
- **Gate/Reveal**: Hide ideas during collection, reveal all at once
- **Real-time**: Live updates via Server-Sent Events
- **Simple Reactions**: One clap per person per item
- **Search**: Filter by idea text or author name
- **Export**: Download CSV at end of session
- **Ephemeral**: Auto-expires after 7 days

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Server-Sent Events
- **Database**: Firestore with native TTL support (or in-memory mock for development)
- **Hosting**: Google Cloud Run

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vswami78/wwwn-retrospective.git
cd wwwn-retrospective
```

2. Install dependencies:
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

3. Start development servers:
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

4. Open http://localhost:5173

## Deployment to Google Cloud Run

### Prerequisites

- Google Cloud account
- `gcloud` CLI installed and configured
- Docker installed (optional, for local testing)

### One-Command Deployment

```bash
./deploy.sh your-project-id us-west1
```

This script will:
1. Deploy the backend to Cloud Run
2. Deploy the frontend to Cloud Run
3. Configure CORS automatically
4. Output the URLs for both services

### Manual Deployment

#### Deploy Backend

```bash
cd server
gcloud run deploy wwwn-backend \
  --source . \
  --platform managed \
  --region us-west1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=8080"
```

#### Deploy Frontend

```bash
cd client
gcloud run deploy wwwn-frontend \
  --source . \
  --platform managed \
  --region us-west1 \
  --allow-unauthenticated \
  --set-build-env-vars "VITE_API_URL=https://your-backend-url/api"
```

## Usage

### As Facilitator

1. Click "Create New Board"
2. Share the board URL with participants (remove `?token=...` for participant link)
3. Keep gate checkbox ON while collecting feedback
4. Check reveal checkbox when ready to discuss
5. Export CSV at end of session

### As Participant

1. Open shared board URL
2. Select "I like..." or "I wish..."
3. Enter your feedback and name
4. Submit as many items as needed
5. Wait for facilitator to reveal
6. Clap on items you agree with

## Architecture

### Backend (`/server`)

- `src/models/` - Data models (Board, Item, Clap)
- `src/repositories/` - Data access layer
- `src/routes/` - API endpoints
- `src/services/` - SSE service for real-time updates
- `src/middleware/` - Auth and rate limiting
- `src/config/` - Firebase and mock Firestore configuration

### Frontend (`/client`)

- `src/pages/` - Page components (Home, Board)
- `src/components/` - UI components
- `src/context/` - React context for board state
- `src/services/` - API client
- `src/utils/` - Client ID management

## API Endpoints

```
POST   /api/boards                              Create board
GET    /api/boards/:id                          Get board
POST   /api/boards/:id/reveal                   Toggle reveal (facilitator)
GET    /api/boards/:id/events                   SSE stream
POST   /api/boards/:id/items                    Create item
GET    /api/boards/:id/items                    List items
DELETE /api/boards/:id/items/:itemId            Delete item (facilitator)
POST   /api/boards/:id/items/:itemId/clap       Add clap
GET    /api/boards/:id/export.csv               Export CSV (facilitator)
```

## Environment Variables

### Backend

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DEFAULT_BOARD_TTL_DAYS=7
```

### Frontend

```env
VITE_API_URL=http://localhost:3001/api
```

## Docker

### Build Images Locally

```bash
# Backend
cd server
docker build -t wwwn-backend .

# Frontend
cd client
docker build --build-arg VITE_API_URL=http://localhost:3001/api -t wwwn-frontend .
```

### Run with Docker

```bash
# Backend
docker run -p 8080:8080 -e PORT=8080 wwwn-backend

# Frontend
docker run -p 8081:8080 wwwn-frontend
```

## Cost Estimate (Cloud Run)

With `--min-instances=0`:
- Backend: ~$0 (free tier covers quarterly 1-hour sessions)
- Frontend: ~$0 (free tier)
- Firestore: ~$0 (free tier covers light usage)

**Total: ~$0/month for quarterly usage**

## License

MIT
