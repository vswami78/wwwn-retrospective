# WWWN Retrospective App - Developer Notes

## Architecture Overview

- **Backend**: Node.js + Express + Server-Sent Events (SSE) for real-time updates
- **Frontend**: React 18 + Vite + Tailwind CSS v3
- **Database**: Firestore with native TTL support (or in-memory mock for development)
- **Deployment**: Google Cloud Run (Docker containers)

## Key Technical Decisions

### Client Identity
- Each client gets a persistent UUID stored in localStorage (using nanoid)
- Used for "one clap per person per item" enforcement
- Tracked via `x-client-id` header in API requests
- Generated in `client/src/utils/clientId.js`

### Real-time Updates
- Server-Sent Events (SSE) for live updates to all connected clients
- Event types: `item-added`, `item-clapped`, `reveal-changed`, `item-deleted`
- Implementation: `server/src/services/sseService.js`
- Maintains per-board client connections using Map of Sets

### Sorting Behavior
- **Manual sorting only** - no automatic re-sorting when clap counts change
- Prevents disorienting UX during active collaboration (items jumping around)
- User must explicitly click column header to sort
- Field name: `item.claps` (not `clapCount` - this was a bug we fixed)
- Default: no sort applied (chronological order)

### Gate/Reveal Mechanism
- **Gate enabled**: Items are hidden from participants until facilitator reveals
- **Facilitator**: Always sees all items regardless of gate/reveal state
- **Participants**: See items only after reveal is toggled on
- Implementation in `ItemRow.jsx`: checks `board.gateEnabled && !board.revealed && !isFacilitator`

### Facilitator Authentication
- Token-based: facilitator gets unique token when creating board
- Token stored in URL query param: `?token=...`
- Participant link: same URL without token parameter
- Middleware: `server/src/middleware/auth.js`

## Project Structure

### Backend (`/server`)
```
src/
├── models/          # Data models (Board, Item, Clap)
├── repositories/    # Data access layer (Firestore operations)
├── routes/          # API endpoints
├── services/        # SSE service for real-time updates
├── middleware/      # Auth and rate limiting
└── config/          # Firebase and mock Firestore configuration
```

### Frontend (`/client`)
```
src/
├── pages/           # Page components (Home, Board)
├── components/      # UI components (ItemTable, ItemRow, etc.)
├── context/         # React context for board state
├── services/        # API client
├── utils/           # Client ID management
└── hooks/           # Custom React hooks
```

## Important Field Names

**Backend Item model** (`server/src/models/Item.js`):
- `id`, `boardId`, `starter`, `idea`, `who`, `claps`, `createdAt`

**Frontend expects**:
- `item.claps` (NOT `clapCount`) - this was a bug we fixed
- Sort by: `(b.claps || 0) - (a.claps || 0)`

## Development Workflow

### Local Development

**Terminal 1 - Backend:**
```bash
cd server
npm run dev  # Runs on port 3001
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev  # Runs on port 5173
```

The app uses mock Firestore by default if Firebase credentials aren't found, so no Firebase setup is needed for local development.

### Environment Variables

**Backend** (`server/.env` or Cloud Run):
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DEFAULT_BOARD_TTL_DAYS=7
```

**Frontend** (`client/.env` or build args):
```env
VITE_API_URL=http://localhost:3001/api
```

## Deployment to Google Cloud Run

### Critical Deployment Notes

1. **Frontend API URL is build-time only** - Must be set via Docker build arg:
   ```bash
   docker build --build-arg VITE_API_URL=https://backend-url/api
   ```

2. **Platform requirement** - Cloud Run requires `linux/amd64`:
   ```bash
   docker build --platform linux/amd64 ...
   ```

3. **Docker authentication** - Configure once:
   ```bash
   gcloud auth configure-docker us-west1-docker.pkg.dev
   ```

### Deployment Process

**Backend:**
```bash
cd server
gcloud run deploy wwwn-backend \
  --source . \
  --region us-west1 \
  --set-env-vars "NODE_ENV=production,DEFAULT_BOARD_TTL_DAYS=7"
```

**Frontend (Docker-based):**
```bash
cd client

# Get backend URL
BACKEND_URL=$(gcloud run services describe wwwn-backend --region us-west1 --format 'value(status.url)')

# Build with correct platform and API URL
docker build --platform linux/amd64 \
  --build-arg VITE_API_URL=$BACKEND_URL/api \
  -t us-west1-docker.pkg.dev/wwwn-gcr/cloud-run-source-deploy/wwwn-frontend:latest \
  .

# Push to Artifact Registry
docker push us-west1-docker.pkg.dev/wwwn-gcr/cloud-run-source-deploy/wwwn-frontend:latest

# Deploy to Cloud Run
gcloud run deploy wwwn-frontend \
  --image us-west1-docker.pkg.dev/wwwn-gcr/cloud-run-source-deploy/wwwn-frontend:latest \
  --region us-west1 \
  --allow-unauthenticated
```

**Update CORS:**
```bash
cd server
FRONTEND_URL=$(gcloud run services describe wwwn-frontend --region us-west1 --format 'value(status.url)')

gcloud run services update wwwn-backend \
  --region us-west1 \
  --update-env-vars "CORS_ORIGIN=$FRONTEND_URL"
```

### Deployment Script

Use `./deploy.sh PROJECT_ID REGION` for automated deployment of both services.

## Common Issues & Solutions

### "Failed to fetch" Error
- **Cause**: Wrong API URL in frontend build, or browser cache
- **Solution**:
  1. Check frontend was built with correct `VITE_API_URL`
  2. Verify CORS is configured: `gcloud run services describe wwwn-backend --format='value(spec.template.spec.containers[0].env)'`
  3. Try incognito/private browsing to rule out cache

### Sorting Not Working
- **Cause**: Using wrong field name (`clapCount` instead of `claps`)
- **Solution**: Always use `item.claps` in frontend code
- **Reference**: Fixed in commit d543842

### Docker Build Platform Error
- **Cause**: Building on ARM Mac without `--platform linux/amd64`
- **Error**: `Container manifest type must support amd64/linux`
- **Solution**: Always include `--platform linux/amd64` flag

### SSE Connection Issues
- **Symptom**: Real-time updates not working
- **Check**: Browser developer tools → Network tab → Look for `/events` connection
- **Common cause**: CORS misconfiguration

## Testing

### Local Testing
1. Start both backend and frontend dev servers
2. Open http://localhost:5173
3. Create a board (becomes facilitator)
4. Open board URL without token in incognito (becomes participant)
5. Test gate/reveal, adding items, clapping

### Production Testing
1. Create board at https://wwwn-frontend-ix74xlmaia-uw.a.run.app
2. Share participant link (remove `?token=...`)
3. Test all features end-to-end

## Current Feature TODOs

1. **Show user's own items when gate is enabled** - Users should see their own submissions, only hide others' items
2. **Add ability to edit own items** - Allow editing feedback after submission
3. **Add ability to toggle/remove own clap** - Undo a clap if user changes their mind

## URLs

- **Production Frontend**: https://wwwn-frontend-ix74xlmaia-uw.a.run.app
- **Production Backend**: https://wwwn-backend-ix74xlmaia-uw.a.run.app
- **Repository**: https://github.com/vswami78/wwwn-retrospective
- **GCP Project**: wwwn-gcr
- **Region**: us-west1

## Technology Versions

- Node.js: 18+ (local dev)
- React: 18
- Vite: 7.1.9
- Tailwind CSS: 3.x (downgraded from v4 for stability)
- Express: Latest
- Firestore: Latest SDK

## Code Style & Patterns

- **ES Modules**: Using `type: "module"` in package.json
- **React Hooks**: Functional components with hooks (no class components)
- **Context API**: BoardContext for state management
- **Repository Pattern**: Data access abstraction in backend
- **Environment-based config**: Mock Firestore for dev, real Firestore for production
