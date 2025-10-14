# Manual Testing for Board API Endpoints

## Prerequisites

1. Set up Firebase service account:
   - Download your Firebase service account key JSON from Firebase Console
   - Save it as `server/serviceAccountKey.json`

2. Update `.env` with your Firebase project ID:
   ```
   FIRESTORE_PROJECT_ID=your-actual-project-id
   ```

## Start the Server

```bash
cd server
npm run dev
```

Expected output: `Server running on port 3001`

## Test Board API Endpoints

### 1. Create a new board

```bash
curl -X POST http://localhost:3001/api/boards \
  -H "Content-Type: application/json"
```

Expected response (201):
```json
{
  "id": "ABC123XYZ",
  "createdAt": "2025-10-13T...",
  "revealed": false,
  "gateEnabled": true,
  "ttlAt": "2025-10-20T...",
  "facilitatorToken": "long-random-token"
}
```

Save the `id` and `facilitatorToken` for subsequent tests.

### 2. Get board metadata

```bash
curl http://localhost:3001/api/boards/ABC123XYZ
```

Expected response (200):
```json
{
  "id": "ABC123XYZ",
  "createdAt": "2025-10-13T...",
  "revealed": false,
  "gateEnabled": true,
  "ttlAt": "2025-10-20T...",
  "facilitatorToken": "long-random-token"
}
```

### 3. Get non-existent board (should fail)

```bash
curl http://localhost:3001/api/boards/nonexistent
```

Expected response (404):
```json
{
  "error": "Board not found"
}
```

### 4. Toggle reveal without auth (should fail)

```bash
curl -X POST http://localhost:3001/api/boards/ABC123XYZ/reveal \
  -H "Content-Type: application/json" \
  -d '{"revealed": true}'
```

Expected response (401):
```json
{
  "error": "Facilitator token required"
}
```

### 5. Toggle reveal with wrong token (should fail)

```bash
curl -X POST http://localhost:3001/api/boards/ABC123XYZ/reveal \
  -H "Content-Type: application/json" \
  -H "x-facilitator-token: wrong-token" \
  -d '{"revealed": true}'
```

Expected response (403):
```json
{
  "error": "Invalid facilitator token"
}
```

### 6. Toggle reveal with correct token (should succeed)

```bash
curl -X POST http://localhost:3001/api/boards/ABC123XYZ/reveal \
  -H "Content-Type: application/json" \
  -H "x-facilitator-token: YOUR_ACTUAL_FACILITATOR_TOKEN" \
  -d '{"revealed": true}'
```

Expected response (200):
```json
{
  "id": "ABC123XYZ",
  "createdAt": "2025-10-13T...",
  "revealed": true,
  "gateEnabled": true,
  "ttlAt": "2025-10-20T...",
  "facilitatorToken": "long-random-token"
}
```

### 7. Toggle reveal back to false

```bash
curl -X POST http://localhost:3001/api/boards/ABC123XYZ/reveal \
  -H "Content-Type: application/json" \
  -H "x-facilitator-token: YOUR_ACTUAL_FACILITATOR_TOKEN" \
  -d '{"revealed": false}'
```

Expected response (200):
```json
{
  "id": "ABC123XYZ",
  "revealed": false,
  ...
}
```

## Verification Checklist

- [ ] POST /api/boards creates a new board with all required fields
- [ ] GET /api/boards/:id returns board metadata
- [ ] GET /api/boards/:id returns 404 for non-existent board
- [ ] POST /api/boards/:id/reveal requires facilitator token (401 without)
- [ ] POST /api/boards/:id/reveal validates token matches board (403 with wrong token)
- [ ] POST /api/boards/:id/reveal successfully toggles revealed state with correct token
- [ ] Routes are properly wired in /api/boards path
