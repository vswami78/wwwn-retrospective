# WWWN Retrospective Board - MVP Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Build a real-time, ephemeral "I Like / I Wish" retrospective board web app with gate/reveal mechanism for live feedback sessions.

**Architecture:** Full-stack application with React+Tailwind frontend SPA, Node.js Express backend API, Firestore for storage with native TTL support, and Server-Sent Events (SSE) for real-time updates. Anonymous client identity via localStorage UUID.

**Tech Stack:** React 18, Vite, Tailwind CSS, Node.js, Express, Firestore Admin SDK, nanoid for IDs, date-fns for timestamps

---

## Project Setup Phase

### Task 1: Initialize Project Structure

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `README.md`

**Step 1: Initialize Node.js project**

Run: `npm init -y`
Expected: Creates basic package.json

**Step 2: Create project structure**

```bash
mkdir -p client server docs/plans
```

**Step 3: Create .gitignore**

Create `.gitignore`:
```
node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
serviceAccountKey.json
```

**Step 4: Create README with setup instructions**

Create `README.md`:
```markdown
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
```

**Step 5: Commit**

```bash
git add .
git commit -m "chore: initialize project structure"
```

---

### Task 2: Setup Backend Scaffold

**Files:**
- Create: `server/package.json`
- Create: `server/.env.example`
- Create: `server/src/index.js`
- Create: `server/src/config/firebase.js`

**Step 1: Initialize server package**

```bash
cd server
npm init -y
```

**Step 2: Install backend dependencies**

Run: `npm install express cors dotenv firebase-admin nanoid@3 express-rate-limit helmet`
Run: `npm install --save-dev nodemon jest supertest`

**Step 3: Update server/package.json scripts**

Modify `server/package.json`:
```json
{
  "name": "wwwn-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "test": "NODE_OPTIONS=--experimental-vm-modules jest"
  }
}
```

**Step 4: Create environment template**

Create `server/.env.example`:
```
PORT=3001
NODE_ENV=development
FIRESTORE_PROJECT_ID=your-project-id
FIRESTORE_CREDENTIALS_PATH=./serviceAccountKey.json
CORS_ORIGIN=http://localhost:5173
DEFAULT_BOARD_TTL_DAYS=7
```

**Step 5: Create Firebase config**

Create `server/src/config/firebase.js`:
```javascript
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = JSON.parse(
  readFileSync(process.env.FIRESTORE_CREDENTIALS_PATH, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIRESTORE_PROJECT_ID
});

export const db = admin.firestore();

// Configure TTL policy
export const BOARD_TTL_DAYS = parseInt(process.env.DEFAULT_BOARD_TTL_DAYS || '7', 10);
```

**Step 6: Create basic Express server**

Create `server/src/index.js`:
```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

**Step 7: Test server starts**

Run: `npm run dev`
Expected: "Server running on port 3001"

**Step 8: Commit**

```bash
git add .
git commit -m "feat: setup backend scaffold with Express and Firebase config"
```

---

### Task 3: Setup Frontend Scaffold

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/tailwind.config.js`
- Create: `client/index.html`
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`

**Step 1: Initialize Vite React project**

```bash
npm create vite@latest client -- --template react
cd client
```

**Step 2: Install frontend dependencies**

Run: `npm install`
Run: `npm install tailwindcss postcss autoprefixer axios date-fns nanoid@3`
Run: `npm install --save-dev @vitejs/plugin-react`

**Step 3: Initialize Tailwind**

Run: `npx tailwindcss init -p`

**Step 4: Configure Tailwind**

Modify `client/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'like': '#10b981', // green
        'wish': '#a855f7', // purple
      }
    },
  },
  plugins: [],
}
```

**Step 5: Create Tailwind base styles**

Create `client/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-900 text-gray-100;
  }
}
```

**Step 6: Create basic App component**

Replace `client/src/App.jsx`:
```jsx
import { useState } from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <header className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold">WWWN Retrospective Board</h1>
      </header>
      <main className="max-w-7xl mx-auto">
        <p className="text-gray-400">Loading...</p>
      </main>
    </div>
  );
}

export default App;
```

**Step 7: Update main entry point**

Replace `client/src/main.jsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

**Step 8: Test frontend starts**

Run: `npm run dev`
Expected: Vite server at http://localhost:5173

**Step 9: Commit**

```bash
git add .
git commit -m "feat: setup frontend scaffold with Vite, React, and Tailwind"
```

---

## Backend Core Implementation

### Task 4: Implement Board Data Model and Repository

**Files:**
- Create: `server/src/models/Board.js`
- Create: `server/src/repositories/BoardRepository.js`
- Create: `server/src/repositories/__tests__/BoardRepository.test.js`

**Step 1: Write failing test for Board creation**

Create `server/src/repositories/__tests__/BoardRepository.test.js`:
```javascript
import { BoardRepository } from '../BoardRepository.js';

// Mock Firestore
const mockDb = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(() => Promise.resolve()),
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) }))
    })),
    add: jest.fn(() => Promise.resolve({ id: 'mock-id' }))
  }))
};

describe('BoardRepository', () => {
  let repo;

  beforeEach(() => {
    repo = new BoardRepository(mockDb);
  });

  test('createBoard creates a new board with correct defaults', async () => {
    const board = await repo.createBoard();

    expect(board.id).toBeDefined();
    expect(board.revealed).toBe(false);
    expect(board.gateEnabled).toBe(true);
    expect(board.createdAt).toBeInstanceOf(Date);
    expect(board.ttlAt).toBeInstanceOf(Date);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd server && npm test`
Expected: FAIL with "Cannot find module '../BoardRepository.js'"

**Step 3: Create Board model**

Create `server/src/models/Board.js`:
```javascript
export class Board {
  constructor(data) {
    this.id = data.id;
    this.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
    this.revealed = data.revealed ?? false;
    this.gateEnabled = data.gateEnabled ?? true;
    this.ttlAt = data.ttlAt instanceof Date ? data.ttlAt : new Date(data.ttlAt);
    this.facilitatorToken = data.facilitatorToken;
  }

  toFirestore() {
    return {
      createdAt: this.createdAt,
      revealed: this.revealed,
      gateEnabled: this.gateEnabled,
      ttlAt: this.ttlAt,
      facilitatorToken: this.facilitatorToken
    };
  }

  static fromFirestore(id, data) {
    return new Board({
      id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      ttlAt: data.ttlAt?.toDate?.() || data.ttlAt
    });
  }
}
```

**Step 4: Implement BoardRepository**

Create `server/src/repositories/BoardRepository.js`:
```javascript
import { nanoid } from 'nanoid';
import { Board } from '../models/Board.js';

export class BoardRepository {
  constructor(db, ttlDays = 7) {
    this.db = db;
    this.ttlDays = ttlDays;
    this.collection = db.collection('boards');
  }

  async createBoard() {
    const now = new Date();
    const ttlAt = new Date(now.getTime() + this.ttlDays * 24 * 60 * 60 * 1000);

    const boardData = {
      id: nanoid(10),
      createdAt: now,
      revealed: false,
      gateEnabled: true,
      ttlAt: ttlAt,
      facilitatorToken: nanoid(32)
    };

    const board = new Board(boardData);
    await this.collection.doc(board.id).set(board.toFirestore());

    return board;
  }

  async getBoard(boardId) {
    const doc = await this.collection.doc(boardId).get();

    if (!doc.exists) {
      return null;
    }

    return Board.fromFirestore(boardId, doc.data());
  }

  async updateBoard(boardId, updates) {
    await this.collection.doc(boardId).update(updates);
    return this.getBoard(boardId);
  }

  async deleteBoard(boardId) {
    await this.collection.doc(boardId).delete();
  }
}
```

**Step 5: Run test to verify it passes**

Run: `cd server && npm test`
Expected: PASS

**Step 6: Add more tests for edge cases**

Add to `server/src/repositories/__tests__/BoardRepository.test.js`:
```javascript
test('getBoard returns null for non-existent board', async () => {
  const mockDb = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: false }))
      }))
    }))
  };

  const repo = new BoardRepository(mockDb);
  const board = await repo.getBoard('nonexistent');

  expect(board).toBeNull();
});

test('updateBoard updates revealed status', async () => {
  const mockBoardData = {
    revealed: false,
    gateEnabled: true,
    createdAt: new Date(),
    ttlAt: new Date(),
    facilitatorToken: 'token123'
  };

  const mockDb = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        update: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve({
          exists: true,
          data: () => ({ ...mockBoardData, revealed: true })
        }))
      }))
    }))
  };

  const repo = new BoardRepository(mockDb);
  const updated = await repo.updateBoard('board123', { revealed: true });

  expect(updated.revealed).toBe(true);
});
```

**Step 7: Run tests**

Run: `npm test`
Expected: All tests PASS

**Step 8: Commit**

```bash
git add .
git commit -m "feat: implement Board model and repository with tests"
```

---

### Task 5: Implement Item Data Model and Repository

**Files:**
- Create: `server/src/models/Item.js`
- Create: `server/src/repositories/ItemRepository.js`
- Create: `server/src/repositories/__tests__/ItemRepository.test.js`

**Step 1: Write failing test for Item creation**

Create `server/src/repositories/__tests__/ItemRepository.test.js`:
```javascript
import { ItemRepository } from '../ItemRepository.js';

const mockDb = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(() => Promise.resolve())
    })),
    where: jest.fn(() => ({
      orderBy: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [] }))
      }))
    }))
  }))
};

describe('ItemRepository', () => {
  let repo;

  beforeEach(() => {
    repo = new ItemRepository(mockDb);
  });

  test('createItem creates a new item with correct fields', async () => {
    const itemData = {
      boardId: 'board123',
      starter: 'like',
      idea: 'Great collaboration',
      who: 'Alice'
    };

    const item = await repo.createItem(itemData);

    expect(item.id).toBeDefined();
    expect(item.boardId).toBe('board123');
    expect(item.starter).toBe('like');
    expect(item.idea).toBe('Great collaboration');
    expect(item.who).toBe('Alice');
    expect(item.claps).toBe(0);
    expect(item.createdAt).toBeInstanceOf(Date);
  });

  test('createItem validates starter enum', async () => {
    const itemData = {
      boardId: 'board123',
      starter: 'invalid',
      idea: 'Test',
      who: 'Bob'
    };

    await expect(repo.createItem(itemData)).rejects.toThrow('Invalid starter');
  });

  test('createItem validates idea length', async () => {
    const itemData = {
      boardId: 'board123',
      starter: 'like',
      idea: 'x'.repeat(201),
      who: 'Bob'
    };

    await expect(repo.createItem(itemData)).rejects.toThrow('Idea must be 1-200 characters');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd server && npm test`
Expected: FAIL with "Cannot find module '../ItemRepository.js'"

**Step 3: Create Item model**

Create `server/src/models/Item.js`:
```javascript
export class Item {
  constructor(data) {
    this.id = data.id;
    this.boardId = data.boardId;
    this.starter = data.starter; // 'like' | 'wish'
    this.idea = data.idea;
    this.who = data.who;
    this.claps = data.claps ?? 0;
    this.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
  }

  toFirestore() {
    return {
      boardId: this.boardId,
      starter: this.starter,
      idea: this.idea,
      who: this.who,
      claps: this.claps,
      createdAt: this.createdAt
    };
  }

  static fromFirestore(id, data) {
    return new Item({
      id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt
    });
  }

  validate() {
    if (!['like', 'wish'].includes(this.starter)) {
      throw new Error('Invalid starter: must be "like" or "wish"');
    }
    if (!this.idea || this.idea.length < 1 || this.idea.length > 200) {
      throw new Error('Idea must be 1-200 characters');
    }
    if (!this.who || this.who.length < 1 || this.who.length > 60) {
      throw new Error('Who must be 1-60 characters');
    }
  }
}
```

**Step 4: Implement ItemRepository**

Create `server/src/repositories/ItemRepository.js`:
```javascript
import { nanoid } from 'nanoid';
import { Item } from '../models/Item.js';

export class ItemRepository {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('items');
  }

  async createItem(data) {
    const itemData = {
      id: nanoid(16),
      boardId: data.boardId,
      starter: data.starter,
      idea: data.idea,
      who: data.who,
      claps: 0,
      createdAt: new Date()
    };

    const item = new Item(itemData);
    item.validate();

    await this.collection.doc(item.id).set(item.toFirestore());

    return item;
  }

  async getItemsByBoard(boardId, since = null) {
    let query = this.collection
      .where('boardId', '==', boardId)
      .orderBy('createdAt', 'asc');

    if (since) {
      query = query.where('createdAt', '>', since);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => Item.fromFirestore(doc.id, doc.data()));
  }

  async getItem(itemId) {
    const doc = await this.collection.doc(itemId).get();

    if (!doc.exists) {
      return null;
    }

    return Item.fromFirestore(itemId, doc.data());
  }

  async deleteItem(itemId) {
    await this.collection.doc(itemId).delete();
  }

  async incrementClaps(itemId) {
    const itemRef = this.collection.doc(itemId);
    await this.db.runTransaction(async (transaction) => {
      const itemDoc = await transaction.get(itemRef);
      if (!itemDoc.exists) {
        throw new Error('Item not found');
      }
      const newClaps = (itemDoc.data().claps || 0) + 1;
      transaction.update(itemRef, { claps: newClaps });
    });

    return this.getItem(itemId);
  }
}
```

**Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add .
git commit -m "feat: implement Item model and repository with validation"
```

---

### Task 6: Implement Clap Tracking with Client Identity

**Files:**
- Create: `server/src/models/Clap.js`
- Create: `server/src/repositories/ClapRepository.js`
- Create: `server/src/repositories/__tests__/ClapRepository.test.js`

**Step 1: Write failing test for Clap tracking**

Create `server/src/repositories/__tests__/ClapRepository.test.js`:
```javascript
import { ClapRepository } from '../ClapRepository.js';

const mockDb = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(() => Promise.resolve())
    })),
    where: jest.fn(() => ({
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [] }))
      }))
    }))
  }))
};

describe('ClapRepository', () => {
  let repo;

  beforeEach(() => {
    repo = new ClapRepository(mockDb);
  });

  test('addClap creates a clap record', async () => {
    const clap = await repo.addClap({
      boardId: 'board123',
      itemId: 'item456',
      clientId: 'client789'
    });

    expect(clap.id).toBeDefined();
    expect(clap.boardId).toBe('board123');
    expect(clap.itemId).toBe('item456');
    expect(clap.clientId).toBe('client789');
    expect(clap.createdAt).toBeInstanceOf(Date);
  });

  test('hasClientClapped returns true if client already clapped', async () => {
    const mockDb = {
      collection: jest.fn(() => ({
        where: jest.fn(() => ({
          where: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({ docs: [{ id: 'clap1' }] }))
          }))
        }))
      }))
    };

    const repo = new ClapRepository(mockDb);
    const hasClapped = await repo.hasClientClapped('item456', 'client789');

    expect(hasClapped).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with "Cannot find module '../ClapRepository.js'"

**Step 3: Create Clap model**

Create `server/src/models/Clap.js`:
```javascript
export class Clap {
  constructor(data) {
    this.id = data.id;
    this.boardId = data.boardId;
    this.itemId = data.itemId;
    this.clientId = data.clientId;
    this.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
  }

  toFirestore() {
    return {
      boardId: this.boardId,
      itemId: this.itemId,
      clientId: this.clientId,
      createdAt: this.createdAt
    };
  }

  static fromFirestore(id, data) {
    return new Clap({
      id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt
    });
  }
}
```

**Step 4: Implement ClapRepository**

Create `server/src/repositories/ClapRepository.js`:
```javascript
import { nanoid } from 'nanoid';
import { Clap } from '../models/Clap.js';

export class ClapRepository {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('claps');
  }

  async addClap(data) {
    const clapData = {
      id: nanoid(16),
      boardId: data.boardId,
      itemId: data.itemId,
      clientId: data.clientId,
      createdAt: new Date()
    };

    const clap = new Clap(clapData);
    await this.collection.doc(clap.id).set(clap.toFirestore());

    return clap;
  }

  async hasClientClapped(itemId, clientId) {
    const snapshot = await this.collection
      .where('itemId', '==', itemId)
      .where('clientId', '==', clientId)
      .get();

    return !snapshot.empty;
  }

  async getClapsForItem(itemId) {
    const snapshot = await this.collection
      .where('itemId', '==', itemId)
      .get();

    return snapshot.docs.map(doc => Clap.fromFirestore(doc.id, doc.data()));
  }
}
```

**Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add .
git commit -m "feat: implement Clap tracking with client identity"
```

---

### Task 7: Implement Board API Endpoints

**Files:**
- Create: `server/src/routes/boardRoutes.js`
- Create: `server/src/middleware/auth.js`
- Create: `server/src/routes/__tests__/boardRoutes.test.js`
- Modify: `server/src/index.js`

**Step 1: Write failing API test for create board**

Create `server/src/routes/__tests__/boardRoutes.test.js`:
```javascript
import request from 'supertest';
import express from 'express';
import { boardRoutes } from '../boardRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/boards', boardRoutes);

describe('Board API Routes', () => {
  test('POST /api/boards creates a new board', async () => {
    const response = await request(app)
      .post('/api/boards')
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.revealed).toBe(false);
    expect(response.body.gateEnabled).toBe(true);
    expect(response.body.facilitatorToken).toBeDefined();
  });

  test('GET /api/boards/:id returns board', async () => {
    const createResponse = await request(app)
      .post('/api/boards')
      .expect(201);

    const boardId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/boards/${boardId}`)
      .expect(200);

    expect(response.body.id).toBe(boardId);
  });

  test('GET /api/boards/:id returns 404 for non-existent board', async () => {
    await request(app)
      .get('/api/boards/nonexistent')
      .expect(404);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with "Cannot find module '../boardRoutes.js'"

**Step 3: Create auth middleware**

Create `server/src/middleware/auth.js`:
```javascript
export function verifyFacilitator(req, res, next) {
  const token = req.headers['x-facilitator-token'];

  if (!token) {
    return res.status(401).json({ error: 'Facilitator token required' });
  }

  req.facilitatorToken = token;
  next();
}

export function extractClientId(req, res, next) {
  const clientId = req.headers['x-client-id'];

  if (!clientId) {
    return res.status(400).json({ error: 'Client ID required' });
  }

  req.clientId = clientId;
  next();
}
```

**Step 4: Implement board routes**

Create `server/src/routes/boardRoutes.js`:
```javascript
import express from 'express';
import { db } from '../config/firebase.js';
import { BoardRepository } from '../repositories/BoardRepository.js';
import { verifyFacilitator } from '../middleware/auth.js';

const router = express.Router();
const boardRepo = new BoardRepository(db);

// POST /boards - Create new board
router.post('/', async (req, res) => {
  try {
    const board = await boardRepo.createBoard();
    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// GET /boards/:id - Get board metadata
router.get('/:id', async (req, res) => {
  try {
    const board = await boardRepo.getBoard(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// POST /boards/:id/reveal - Toggle reveal (facilitator only)
router.post('/:id/reveal', verifyFacilitator, async (req, res) => {
  try {
    const board = await boardRepo.getBoard(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.facilitatorToken !== req.facilitatorToken) {
      return res.status(403).json({ error: 'Invalid facilitator token' });
    }

    const { revealed } = req.body;
    const updated = await boardRepo.updateBoard(req.params.id, { revealed });

    res.json(updated);
  } catch (error) {
    console.error('Error updating reveal:', error);
    res.status(500).json({ error: 'Failed to update reveal' });
  }
});

export { router as boardRoutes };
```

**Step 5: Wire up routes in main app**

Modify `server/src/index.js` - add before the listen() call:
```javascript
import { boardRoutes } from './routes/boardRoutes.js';

// Routes
app.use('/api/boards', boardRoutes);
```

**Step 6: Run tests**

Run: `npm test`
Expected: Tests PASS (you may need to mock Firebase)

**Step 7: Test manually with server running**

Run: `npm run dev`
Then in another terminal:
```bash
curl -X POST http://localhost:3001/api/boards
```
Expected: JSON with new board

**Step 8: Commit**

```bash
git add .
git commit -m "feat: implement board API endpoints with auth middleware"
```

---

### Task 8: Implement Item API Endpoints

**Files:**
- Create: `server/src/routes/itemRoutes.js`
- Create: `server/src/middleware/rateLimit.js`
- Create: `server/src/routes/__tests__/itemRoutes.test.js`
- Modify: `server/src/index.js`

**Step 1: Write failing test for item creation**

Create `server/src/routes/__tests__/itemRoutes.test.js`:
```javascript
import request from 'supertest';
import express from 'express';
import { itemRoutes } from '../itemRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/boards/:boardId/items', itemRoutes);

describe('Item API Routes', () => {
  test('POST /api/boards/:boardId/items creates a new item', async () => {
    const itemData = {
      starter: 'like',
      idea: 'Great teamwork today',
      who: 'Alice'
    };

    const response = await request(app)
      .post('/api/boards/board123/items')
      .set('x-client-id', 'client123')
      .send(itemData)
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.starter).toBe('like');
    expect(response.body.idea).toBe('Great teamwork today');
    expect(response.body.who).toBe('Alice');
    expect(response.body.claps).toBe(0);
  });

  test('GET /api/boards/:boardId/items returns all items', async () => {
    const response = await request(app)
      .get('/api/boards/board123/items')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL

**Step 3: Create rate limit middleware**

Create `server/src/middleware/rateLimit.js`:
```javascript
import rateLimit from 'express-rate-limit';

export const itemCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: 'Too many items created, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Step 4: Implement item routes**

Create `server/src/routes/itemRoutes.js`:
```javascript
import express from 'express';
import { db } from '../config/firebase.js';
import { ItemRepository } from '../repositories/ItemRepository.js';
import { extractClientId } from '../middleware/auth.js';
import { itemCreationLimiter } from '../middleware/rateLimit.js';

const router = express.Router({ mergeParams: true });
const itemRepo = new ItemRepository(db);

// POST /boards/:boardId/items - Create new item
router.post('/', extractClientId, itemCreationLimiter, async (req, res) => {
  try {
    const { starter, idea, who } = req.body;
    const { boardId } = req.params;

    const item = await itemRepo.createItem({
      boardId,
      starter,
      idea,
      who
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);

    if (error.message.includes('must be') || error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to create item' });
  }
});

// GET /boards/:boardId/items - Get all items for board
router.get('/', async (req, res) => {
  try {
    const { boardId } = req.params;
    const { since } = req.query;

    const sinceDate = since ? new Date(since) : null;
    const items = await itemRepo.getItemsByBoard(boardId, sinceDate);

    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// DELETE /boards/:boardId/items/:itemId - Delete item (facilitator only)
router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    await itemRepo.deleteItem(itemId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export { router as itemRoutes };
```

**Step 5: Wire up item routes**

Modify `server/src/index.js`:
```javascript
import { itemRoutes } from './routes/itemRoutes.js';

app.use('/api/boards/:boardId/items', itemRoutes);
```

**Step 6: Run tests**

Run: `npm test`
Expected: Tests PASS

**Step 7: Commit**

```bash
git add .
git commit -m "feat: implement item API endpoints with rate limiting"
```

---

### Task 9: Implement Clap API Endpoint

**Files:**
- Create: `server/src/routes/clapRoutes.js`
- Modify: `server/src/index.js`

**Step 1: Create clap routes**

Create `server/src/routes/clapRoutes.js`:
```javascript
import express from 'express';
import { db } from '../config/firebase.js';
import { ClapRepository } from '../repositories/ClapRepository.js';
import { ItemRepository } from '../repositories/ItemRepository.js';
import { extractClientId } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });
const clapRepo = new ClapRepository(db);
const itemRepo = new ItemRepository(db);

// POST /boards/:boardId/items/:itemId/clap - Add clap
router.post('/', extractClientId, async (req, res) => {
  try {
    const { boardId, itemId } = req.params;
    const { clientId } = req;

    // Check if client already clapped
    const hasClapped = await clapRepo.hasClientClapped(itemId, clientId);

    if (hasClapped) {
      return res.status(400).json({ error: 'Already clapped for this item' });
    }

    // Add clap record
    await clapRepo.addClap({ boardId, itemId, clientId });

    // Increment item clap count
    const updatedItem = await itemRepo.incrementClaps(itemId);

    res.json(updatedItem);
  } catch (error) {
    console.error('Error adding clap:', error);
    res.status(500).json({ error: 'Failed to add clap' });
  }
});

export { router as clapRoutes };
```

**Step 2: Wire up clap routes**

Modify `server/src/index.js`:
```javascript
import { clapRoutes } from './routes/clapRoutes.js';

app.use('/api/boards/:boardId/items/:itemId/clap', clapRoutes);
```

**Step 3: Test manually**

Run: `npm run dev`
```bash
curl -X POST http://localhost:3001/api/boards/board123/items/item456/clap \
  -H "x-client-id: client789" \
  -H "Content-Type: application/json"
```
Expected: Updated item with incremented claps

**Step 4: Commit**

```bash
git add .
git commit -m "feat: implement clap API endpoint with duplicate prevention"
```

---

### Task 10: Implement Server-Sent Events (SSE) for Real-time Updates

**Files:**
- Create: `server/src/services/SSEService.js`
- Create: `server/src/routes/eventsRoutes.js`
- Modify: `server/src/index.js`

**Step 1: Create SSE service**

Create `server/src/services/SSEService.js`:
```javascript
export class SSEService {
  constructor() {
    this.clients = new Map(); // boardId -> Set of response objects
  }

  addClient(boardId, res) {
    if (!this.clients.has(boardId)) {
      this.clients.set(boardId, new Set());
    }

    this.clients.get(boardId).add(res);

    console.log(`Client connected to board ${boardId}. Total clients: ${this.clients.get(boardId).size}`);
  }

  removeClient(boardId, res) {
    if (this.clients.has(boardId)) {
      this.clients.get(boardId).delete(res);

      if (this.clients.get(boardId).size === 0) {
        this.clients.delete(boardId);
      }

      console.log(`Client disconnected from board ${boardId}`);
    }
  }

  broadcast(boardId, event, data) {
    if (!this.clients.has(boardId)) {
      return;
    }

    const clients = this.clients.get(boardId);
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    clients.forEach(client => {
      try {
        client.write(message);
      } catch (error) {
        console.error('Error broadcasting to client:', error);
        this.removeClient(boardId, client);
      }
    });
  }

  sendToClient(res, event, data) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    res.write(message);
  }
}

export const sseService = new SSEService();
```

**Step 2: Create events routes**

Create `server/src/routes/eventsRoutes.js`:
```javascript
import express from 'express';
import { sseService } from '../services/SSEService.js';

const router = express.Router({ mergeParams: true });

// GET /boards/:boardId/events - SSE endpoint
router.get('/', (req, res) => {
  const { boardId } = req.params;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', boardId })}\n\n`);

  // Add client to SSE service
  sseService.addClient(boardId, res);

  // Handle client disconnect
  req.on('close', () => {
    sseService.removeClient(boardId, res);
  });
});

export { router as eventsRoutes };
```

**Step 3: Wire up events routes and broadcast on changes**

Modify `server/src/index.js`:
```javascript
import { eventsRoutes } from './routes/eventsRoutes.js';
import { sseService } from './services/SSEService.js';

app.use('/api/boards/:boardId/events', eventsRoutes);

// Make sseService available to routes
app.set('sseService', sseService);
```

**Step 4: Update item routes to broadcast changes**

Modify `server/src/routes/itemRoutes.js` - add after successful item creation:
```javascript
// After: const item = await itemRepo.createItem(...)
const sseService = req.app.get('sseService');
sseService.broadcast(boardId, 'item-added', item);
```

**Step 5: Update board routes to broadcast reveal changes**

Modify `server/src/routes/boardRoutes.js` - add after reveal update:
```javascript
// After: const updated = await boardRepo.updateBoard(...)
const sseService = req.app.get('sseService');
sseService.broadcast(req.params.id, 'reveal-changed', { revealed });
```

**Step 6: Update clap routes to broadcast**

Modify `server/src/routes/clapRoutes.js` - add after clap:
```javascript
// After: const updatedItem = await itemRepo.incrementClaps(...)
const sseService = req.app.get('sseService');
sseService.broadcast(boardId, 'item-clapped', updatedItem);
```

**Step 7: Test SSE connection**

Run: `npm run dev`
```bash
curl -N http://localhost:3001/api/boards/board123/events
```
Expected: SSE stream with connected message

**Step 8: Commit**

```bash
git add .
git commit -m "feat: implement SSE for real-time updates"
```

---

### Task 11: Implement CSV Export Endpoint

**Files:**
- Create: `server/src/routes/exportRoutes.js`
- Modify: `server/src/index.js`

**Step 1: Install CSV library**

Run: `npm install json2csv`

**Step 2: Create export routes**

Create `server/src/routes/exportRoutes.js`:
```javascript
import express from 'express';
import { Parser } from 'json2csv';
import { ItemRepository } from '../repositories/ItemRepository.js';
import { db } from '../config/firebase.js';
import { verifyFacilitator } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });
const itemRepo = new ItemRepository(db);

// GET /boards/:boardId/export.csv - Export items as CSV
router.get('/', verifyFacilitator, async (req, res) => {
  try {
    const { boardId } = req.params;
    const items = await itemRepo.getItemsByBoard(boardId);

    const fields = ['starter', 'idea', 'who', 'claps', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(items);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="board-${boardId}-export.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

export { router as exportRoutes };
```

**Step 3: Wire up export routes**

Modify `server/src/index.js`:
```javascript
import { exportRoutes } from './routes/exportRoutes.js';

app.use('/api/boards/:boardId/export.csv', exportRoutes);
```

**Step 4: Test manually**

Run: `npm run dev`
```bash
curl http://localhost:3001/api/boards/board123/export.csv \
  -H "x-facilitator-token: your-token"
```
Expected: CSV file download

**Step 5: Commit**

```bash
git add .
git commit -m "feat: implement CSV export endpoint"
```

---

## Frontend Core Implementation

### Task 12: Implement Client Identity Management

**Files:**
- Create: `client/src/utils/clientId.js`
- Create: `client/src/utils/__tests__/clientId.test.js`

**Step 1: Write failing test for client ID generation**

Create `client/src/utils/__tests__/clientId.test.js`:
```javascript
import { describe, test, expect, beforeEach } from 'vitest';
import { getClientId, generateClientId } from '../clientId';

describe('clientId', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('getClientId generates and persists client ID', () => {
    const clientId = getClientId();
    expect(clientId).toBeDefined();
    expect(typeof clientId).toBe('string');
    expect(clientId.length).toBeGreaterThan(0);

    // Should return same ID on second call
    const clientId2 = getClientId();
    expect(clientId2).toBe(clientId);
  });

  test('getClientId retrieves existing client ID from localStorage', () => {
    const existingId = 'existing-client-123';
    localStorage.setItem('wwwn-client-id', existingId);

    const clientId = getClientId();
    expect(clientId).toBe(existingId);
  });
});
```

**Step 2: Install test dependencies**

Run: `cd client && npm install --save-dev vitest @vitest/ui jsdom`

**Step 3: Add test script to package.json**

Modify `client/package.json`:
```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

**Step 4: Create vitest config**

Create `client/vitest.config.js`:
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true
  }
});
```

**Step 5: Run test to verify it fails**

Run: `npm test`
Expected: FAIL

**Step 6: Implement client ID utility**

Create `client/src/utils/clientId.js`:
```javascript
import { nanoid } from 'nanoid';

const CLIENT_ID_KEY = 'wwwn-client-id';

export function generateClientId() {
  return nanoid();
}

export function getClientId() {
  let clientId = localStorage.getItem(CLIENT_ID_KEY);

  if (!clientId) {
    clientId = generateClientId();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }

  return clientId;
}

export function clearClientId() {
  localStorage.removeItem(CLIENT_ID_KEY);
}
```

**Step 7: Run test to verify it passes**

Run: `npm test`
Expected: PASS

**Step 8: Commit**

```bash
git add .
git commit -m "feat: implement client identity management with localStorage"
```

---

### Task 13: Implement API Client Service

**Files:**
- Create: `client/src/services/api.js`
- Create: `client/src/services/__tests__/api.test.js`

**Step 1: Write failing test for API client**

Create `client/src/services/__tests__/api.test.js`:
```javascript
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../api';

global.fetch = vi.fn();

describe('ApiClient', () => {
  let api;

  beforeEach(() => {
    api = new ApiClient('http://localhost:3001/api', 'client-123');
    vi.clearAllMocks();
  });

  test('createBoard makes POST request', async () => {
    const mockBoard = { id: 'board123', revealed: false };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBoard
    });

    const board = await api.createBoard();

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/boards',
      expect.objectContaining({
        method: 'POST'
      })
    );
    expect(board).toEqual(mockBoard);
  });

  test('getBoard makes GET request with board ID', async () => {
    const mockBoard = { id: 'board123', revealed: false };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBoard
    });

    const board = await api.getBoard('board123');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/boards/board123',
      expect.any(Object)
    );
    expect(board).toEqual(mockBoard);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL

**Step 3: Implement API client**

Create `client/src/services/api.js`:
```javascript
export class ApiClient {
  constructor(baseUrl, clientId, facilitatorToken = null) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
    this.facilitatorToken = facilitatorToken;
  }

  getHeaders(includeClientId = true) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (includeClientId) {
      headers['x-client-id'] = this.clientId;
    }

    if (this.facilitatorToken) {
      headers['x-facilitator-token'] = this.facilitatorToken;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(options.includeClientId !== false),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // Board endpoints
  async createBoard() {
    return this.request('/boards', {
      method: 'POST',
      includeClientId: false
    });
  }

  async getBoard(boardId) {
    return this.request(`/boards/${boardId}`, {
      includeClientId: false
    });
  }

  async toggleReveal(boardId, revealed) {
    return this.request(`/boards/${boardId}/reveal`, {
      method: 'POST',
      body: JSON.stringify({ revealed })
    });
  }

  // Item endpoints
  async createItem(boardId, itemData) {
    return this.request(`/boards/${boardId}/items`, {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  }

  async getItems(boardId, since = null) {
    const query = since ? `?since=${since.toISOString()}` : '';
    return this.request(`/boards/${boardId}/items${query}`);
  }

  async deleteItem(boardId, itemId) {
    return this.request(`/boards/${boardId}/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  // Clap endpoint
  async addClap(boardId, itemId) {
    return this.request(`/boards/${boardId}/items/${itemId}/clap`, {
      method: 'POST'
    });
  }

  // SSE connection
  connectSSE(boardId, onMessage) {
    const url = `${this.baseUrl}/boards/${boardId}/events`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage('message', data);
    };

    eventSource.addEventListener('item-added', (event) => {
      const data = JSON.parse(event.data);
      onMessage('item-added', data);
    });

    eventSource.addEventListener('item-clapped', (event) => {
      const data = JSON.parse(event.data);
      onMessage('item-clapped', data);
    });

    eventSource.addEventListener('reveal-changed', (event) => {
      const data = JSON.parse(event.data);
      onMessage('reveal-changed', data);
    });

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return eventSource;
  }

  // Export
  getExportUrl(boardId) {
    return `${this.baseUrl}/boards/${boardId}/export.csv`;
  }
}
```

**Step 4: Run tests**

Run: `npm test`
Expected: Tests PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: implement API client service with SSE support"
```

---

### Task 14: Create Board Context and Provider

**Files:**
- Create: `client/src/context/BoardContext.jsx`
- Create: `client/src/hooks/useBoard.js`

**Step 1: Create Board Context**

Create `client/src/context/BoardContext.jsx`:
```jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiClient } from '../services/api';
import { getClientId } from '../utils/clientId';

const BoardContext = createContext(null);

export function BoardProvider({ children, boardId, facilitatorToken }) {
  const [board, setBoard] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api] = useState(() => {
    const clientId = getClientId();
    return new ApiClient(import.meta.env.VITE_API_URL || 'http://localhost:3001/api', clientId, facilitatorToken);
  });

  const isFacilitator = !!facilitatorToken;

  // Load board and items
  useEffect(() => {
    if (!boardId) return;

    async function loadBoard() {
      try {
        setLoading(true);
        const [boardData, itemsData] = await Promise.all([
          api.getBoard(boardId),
          api.getItems(boardId)
        ]);
        setBoard(boardData);
        setItems(itemsData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadBoard();
  }, [boardId, api]);

  // Connect to SSE
  useEffect(() => {
    if (!boardId) return;

    const eventSource = api.connectSSE(boardId, (event, data) => {
      if (event === 'item-added') {
        setItems(prev => [...prev, data]);
      } else if (event === 'item-clapped') {
        setItems(prev => prev.map(item =>
          item.id === data.id ? data : item
        ));
      } else if (event === 'reveal-changed') {
        setBoard(prev => ({ ...prev, revealed: data.revealed }));
      }
    });

    return () => {
      eventSource.close();
    };
  }, [boardId, api]);

  const addItem = useCallback(async (itemData) => {
    try {
      const item = await api.createItem(boardId, itemData);
      // Item will be added via SSE event
      return item;
    } catch (err) {
      throw new Error(err.message);
    }
  }, [boardId, api]);

  const addClap = useCallback(async (itemId) => {
    try {
      await api.addClap(boardId, itemId);
      // Item will be updated via SSE event
    } catch (err) {
      throw new Error(err.message);
    }
  }, [boardId, api]);

  const toggleReveal = useCallback(async (revealed) => {
    try {
      await api.toggleReveal(boardId, revealed);
      // Board will be updated via SSE event
    } catch (err) {
      throw new Error(err.message);
    }
  }, [boardId, api]);

  const deleteItem = useCallback(async (itemId) => {
    try {
      await api.deleteItem(boardId, itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      throw new Error(err.message);
    }
  }, [boardId, api]);

  const exportCSV = useCallback(() => {
    const url = api.getExportUrl(boardId);
    window.open(url, '_blank');
  }, [boardId, api]);

  const value = {
    board,
    items,
    loading,
    error,
    isFacilitator,
    addItem,
    addClap,
    toggleReveal,
    deleteItem,
    exportCSV
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within BoardProvider');
  }
  return context;
}
```

**Step 2: Create convenience hook**

Create `client/src/hooks/useBoard.js`:
```javascript
export { useBoard } from '../context/BoardContext';
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: create Board context with real-time updates"
```

---

### Task 15: Create Board Header Component

**Files:**
- Create: `client/src/components/BoardHeader.jsx`

**Step 1: Create BoardHeader component**

Create `client/src/components/BoardHeader.jsx`:
```jsx
import { useBoard } from '../hooks/useBoard';

export function BoardHeader() {
  const { board, isFacilitator, toggleReveal } = useBoard();

  if (!board) return null;

  const handleToggleReveal = (e) => {
    toggleReveal(e.target.checked);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">
          WWWN Retrospective Board
        </h1>

        {isFacilitator && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={board.revealed}
                onChange={handleToggleReveal}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-300">
                ☑ Check to view all answers once everyone is finished adding feedback
              </span>
            </label>
          </div>
        )}

        {!isFacilitator && board.gateEnabled && !board.revealed && (
          <div className="text-gray-400 text-sm">
            Waiting for facilitator to reveal responses...
          </div>
        )}
      </div>
    </header>
  );
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: create BoardHeader with reveal toggle"
```

---

### Task 16: Create Item Composer Component

**Files:**
- Create: `client/src/components/ItemComposer.jsx`

**Step 1: Create ItemComposer component**

Create `client/src/components/ItemComposer.jsx`:
```jsx
import { useState } from 'react';
import { useBoard } from '../hooks/useBoard';

export function ItemComposer() {
  const { addItem } = useBoard();
  const [starter, setStarter] = useState('like');
  const [idea, setIdea] = useState('');
  const [who, setWho] = useState(() => {
    return localStorage.getItem('wwwn-last-who') || '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idea.trim() || !who.trim()) {
      setError('Please fill in both fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addItem({
        starter,
        idea: idea.trim(),
        who: who.trim()
      });

      // Clear idea but keep who
      setIdea('');
      localStorage.setItem('wwwn-last-who', who.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        <div className="flex gap-4 items-end">
          {/* Sentence starters */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStarter('like')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                starter === 'like'
                  ? 'bg-like text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              I like...
            </button>
            <button
              type="button"
              onClick={() => setStarter('wish')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                starter === 'wish'
                  ? 'bg-wish text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              I wish...
            </button>
          </div>

          {/* Idea input */}
          <div className="flex-1">
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Your idea (up to 200 characters)"
              maxLength={200}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Who input */}
          <div className="w-48">
            <input
              type="text"
              value={who}
              onChange={(e) => setWho(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || !idea.trim() || !who.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </div>

        {error && (
          <div className="mt-2 text-red-400 text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: create ItemComposer with sentence starters"
```

---

### Task 17: Create Item Table Component

**Files:**
- Create: `client/src/components/ItemTable.jsx`
- Create: `client/src/components/ItemRow.jsx`

**Step 1: Create ItemRow component**

Create `client/src/components/ItemRow.jsx`:
```jsx
import { useState } from 'react';
import { useBoard } from '../hooks/useBoard';

export function ItemRow({ item }) {
  const { board, isFacilitator, addClap, deleteItem } = useBoard();
  const [isClapping, setIsClapping] = useState(false);
  const [hasClapped, setHasClapped] = useState(() => {
    const clapped = JSON.parse(localStorage.getItem('wwwn-clapped') || '[]');
    return clapped.includes(item.id);
  });

  const isHidden = board.gateEnabled && !board.revealed && !isFacilitator;
  const canClap = board.revealed && !hasClapped;

  const handleClap = async () => {
    if (!canClap || isClapping) return;

    setIsClapping(true);
    try {
      await addClap(item.id);

      // Mark as clapped in localStorage
      const clapped = JSON.parse(localStorage.getItem('wwwn-clapped') || '[]');
      clapped.push(item.id);
      localStorage.setItem('wwwn-clapped', JSON.stringify(clapped));
      setHasClapped(true);
    } catch (err) {
      console.error('Failed to clap:', err);
    } finally {
      setIsClapping(false);
    }
  };

  const handleDelete = async () => {
    if (!isFacilitator) return;

    if (confirm('Delete this item?')) {
      try {
        await deleteItem(item.id);
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition">
      {/* Starter */}
      <td className="px-4 py-3">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          item.starter === 'like'
            ? 'bg-like/20 text-like'
            : 'bg-wish/20 text-wish'
        }`}>
          {item.starter === 'like' ? 'I like...' : 'I wish...'}
        </span>
      </td>

      {/* Idea */}
      <td className="px-4 py-3">
        {isHidden ? (
          <span className="text-gray-500 italic">Hidden until reveal</span>
        ) : (
          <span className="text-gray-100">{item.idea}</span>
        )}
      </td>

      {/* Who */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-medium">
            {getInitials(item.who)}
          </div>
          <span className="text-gray-300">{item.who}</span>
        </div>
      </td>

      {/* Clap */}
      <td className="px-4 py-3">
        <button
          onClick={handleClap}
          disabled={!canClap || isClapping}
          className={`flex items-center gap-2 px-3 py-1 rounded-full transition ${
            canClap
              ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
              : 'bg-gray-800 cursor-not-allowed'
          } ${hasClapped ? 'ring-2 ring-purple-500' : ''}`}
          title={hasClapped ? 'Already clapped' : 'Clap for this'}
        >
          <span>👏</span>
          <span className="text-gray-100 font-medium">{item.claps}</span>
        </button>
      </td>

      {/* Delete (facilitator only) */}
      {isFacilitator && (
        <td className="px-4 py-3">
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 transition"
            title="Delete item"
          >
            ✕
          </button>
        </td>
      )}
    </tr>
  );
}
```

**Step 2: Create ItemTable component**

Create `client/src/components/ItemTable.jsx`:
```jsx
import { useState, useMemo } from 'react';
import { useBoard } from '../hooks/useBoard';
import { ItemRow } from './ItemRow';

export function ItemTable() {
  const { items, isFacilitator } = useBoard();
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;

    const query = search.toLowerCase();
    return items.filter(item =>
      item.idea.toLowerCase().includes(query) ||
      item.who.toLowerCase().includes(query)
    );
  }, [items, search]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Search box */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by idea or name..."
          className="w-64 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Starter</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Idea</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Who</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Clap</th>
              {isFacilitator && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={isFacilitator ? 5 : 4} className="px-4 py-8 text-center text-gray-500">
                  {search ? 'No items match your search' : 'No items yet. Add one below!'}
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <ItemRow key={item.id} item={item} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: create ItemTable with search and ItemRow components"
```

---

### Task 18: Create Board View and Routing

**Files:**
- Create: `client/src/pages/BoardPage.jsx`
- Create: `client/src/pages/HomePage.jsx`
- Modify: `client/src/App.jsx`

**Step 1: Install router**

Run: `npm install react-router-dom`

**Step 2: Create HomePage**

Create `client/src/pages/HomePage.jsx`:
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '../services/api';
import { getClientId } from '../utils/clientId';

export function HomePage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateBoard = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const clientId = getClientId();
      const api = new ApiClient(import.meta.env.VITE_API_URL || 'http://localhost:3001/api', clientId);
      const board = await api.createBoard();

      // Navigate to board as facilitator
      navigate(`/board/${board.id}?token=${board.facilitatorToken}`);
    } catch (err) {
      setError(err.message);
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">WWWN</h1>
          <h2 className="text-2xl text-gray-400 mb-2">I Like / I Wish</h2>
          <p className="text-gray-500">
            A simple retrospective board for collecting feedback
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <button
            onClick={handleCreateBoard}
            disabled={isCreating}
            className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-medium text-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isCreating ? 'Creating Board...' : 'Create New Board'}
          </button>

          {error && (
            <div className="mt-4 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm text-center">
              Or join an existing board by entering the URL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create BoardPage**

Create `client/src/pages/BoardPage.jsx`:
```jsx
import { useParams, useSearchParams } from 'react-router-dom';
import { BoardProvider } from '../context/BoardContext';
import { BoardHeader } from '../components/BoardHeader';
import { ItemTable } from '../components/ItemTable';
import { ItemComposer } from '../components/ItemComposer';
import { useBoard } from '../hooks/useBoard';

function BoardContent() {
  const { loading, error, isFacilitator, exportCSV } = useBoard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <BoardHeader />

      <main className="flex-1 py-8">
        <ItemTable />
      </main>

      <ItemComposer />

      {isFacilitator && (
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex justify-end">
            <button
              onClick={exportCSV}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              Export CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BoardPage() {
  const { boardId } = useParams();
  const [searchParams] = useSearchParams();
  const facilitatorToken = searchParams.get('token');

  return (
    <BoardProvider boardId={boardId} facilitatorToken={facilitatorToken}>
      <BoardContent />
    </BoardProvider>
  );
}
```

**Step 4: Update App with routing**

Replace `client/src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { BoardPage } from './pages/BoardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**Step 5: Create .env file for frontend**

Create `client/.env`:
```
VITE_API_URL=http://localhost:3001/api
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: create board and home pages with routing"
```

---

### Task 19: Manual End-to-End Testing

**Files:**
- Create: `docs/testing-checklist.md`

**Step 1: Create testing checklist**

Create `docs/testing-checklist.md`:
```markdown
# Manual E2E Testing Checklist

## Setup
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Firestore configured and accessible

## Test Flow

### As Facilitator

1. **Create Board**
   - [ ] Click "Create New Board" on home page
   - [ ] Board loads with facilitator view
   - [ ] URL contains token parameter
   - [ ] Reveal checkbox is visible in header

2. **Add Items (Gate ON)**
   - [ ] Select "I like..." starter
   - [ ] Enter idea and name
   - [ ] Submit successfully
   - [ ] Item appears in table
   - [ ] Idea text is visible (facilitator can see)

3. **Toggle Reveal**
   - [ ] Check reveal checkbox
   - [ ] All items remain visible (facilitator)
   - [ ] Clap buttons become enabled

4. **Clap on Items**
   - [ ] Click clap button on item
   - [ ] Counter increments
   - [ ] Button disabled after clapping

5. **Export CSV**
   - [ ] Click "Export CSV" button
   - [ ] CSV file downloads
   - [ ] CSV contains all fields

6. **Delete Item**
   - [ ] Click delete (✕) on item
   - [ ] Confirm deletion
   - [ ] Item removed from table

### As Participant (Separate Browser/Incognito)

1. **Join Board**
   - [ ] Open board URL (without token)
   - [ ] No reveal checkbox visible
   - [ ] No export or delete buttons

2. **Add Items (Gate ON, Not Revealed)**
   - [ ] Add item successfully
   - [ ] Own items show "Hidden until reveal"
   - [ ] Other items show "Hidden until reveal"
   - [ ] Clap buttons disabled

3. **View After Reveal**
   - [ ] Facilitator checks reveal checkbox
   - [ ] All items become visible instantly
   - [ ] Clap buttons become enabled

4. **Clap on Items**
   - [ ] Clap on item
   - [ ] Counter updates in real-time
   - [ ] Cannot clap same item twice

### Real-time Sync

1. **Multi-Client**
   - [ ] Open 3+ browsers to same board
   - [ ] Add item in browser A
   - [ ] Item appears in browsers B & C within 1 second
   - [ ] Clap in browser B
   - [ ] Counter updates in browsers A & C within 1 second
   - [ ] Reveal in facilitator browser
   - [ ] All browsers show revealed state within 1 second

### Search

1. **Filter Items**
   - [ ] Enter search term matching idea
   - [ ] Table filters to matching items
   - [ ] Enter search term matching name
   - [ ] Table filters to matching items
   - [ ] Clear search shows all items

### Edge Cases

1. **Validation**
   - [ ] Submit empty idea - shows error
   - [ ] Submit 201 character idea - truncates at 200
   - [ ] Submit empty name - shows error
   - [ ] Submit 61 character name - truncates at 60

2. **Network Issues**
   - [ ] Add item with network offline
   - [ ] Item queued locally (future: retry on reconnect)
   - [ ] SSE reconnects after disconnect

3. **TTL Expiry**
   - [ ] Board auto-expires after configured TTL
   - [ ] GET request returns 410 Gone

## Performance

- [ ] P50 add-item latency < 300ms
- [ ] P50 clap latency < 250ms
- [ ] 10+ items on board, no UI lag
- [ ] Real-time updates arrive < 1s

## Accessibility

- [ ] Tab through all interactive elements
- [ ] Enter key submits form
- [ ] Space bar claps item
- [ ] Focus indicators visible
- [ ] Color contrast sufficient (dark theme)
```

**Step 2: Run through checklist manually**

Run: `cd server && npm run dev` (terminal 1)
Run: `cd client && npm run dev` (terminal 2)

Go through each checklist item and verify functionality.

**Step 3: Document any issues found**

Create issues in GitHub or TODO comments for any failures.

**Step 4: Commit**

```bash
git add .
git commit -m "docs: add manual E2E testing checklist"
```

---

### Task 20: Final Polish and Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/deployment.md`

**Step 1: Update README**

Replace `README.md`:
```markdown
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
- **Database**: Firestore with native TTL support
- **Hosting**: Google Cloud Run (recommended)

## Quick Start

### Prerequisites

- Node.js 18+
- Firebase project with Firestore enabled
- Service account key JSON file

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

3. Configure environment:

```bash
# server/.env
cp server/.env.example server/.env
# Edit server/.env with your Firebase credentials

# client/.env
echo "VITE_API_URL=http://localhost:3001/api" > client/.env
```

4. Add Firebase service account key:

Download from Firebase Console and save as `server/serviceAccountKey.json`

### Development

```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd client && npm run dev
```

Open http://localhost:5173

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
- `src/repositories/` - Firestore data access layer
- `src/routes/` - API endpoints
- `src/services/` - SSE service for real-time
- `src/middleware/` - Auth and rate limiting

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

## Deployment

See [docs/deployment.md](docs/deployment.md) for Cloud Run deployment instructions.

## Testing

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Manual E2E
See docs/testing-checklist.md
```

## License

MIT
```

**Step 2: Create deployment guide**

Create `docs/deployment.md`:
```markdown
# Deployment Guide - Google Cloud Run

## Prerequisites

- Google Cloud account
- `gcloud` CLI installed
- Firebase project created
- Docker installed locally

## Backend Deployment

### 1. Create Dockerfile

Create `server/Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["node", "src/index.js"]
```

### 2. Create .dockerignore

Create `server/.dockerignore`:
```
node_modules
npm-debug.log
.env
*.test.js
__tests__
```

### 3. Build and deploy

```bash
cd server

# Set project
gcloud config set project YOUR_PROJECT_ID

# Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/wwwn-backend

# Deploy
gcloud run deploy wwwn-backend \
  --image gcr.io/YOUR_PROJECT_ID/wwwn-backend \
  --platform managed \
  --region us-west1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "PORT=8080,NODE_ENV=production,FIRESTORE_PROJECT_ID=YOUR_PROJECT_ID,DEFAULT_BOARD_TTL_DAYS=7" \
  --set-secrets "FIRESTORE_CREDENTIALS_PATH=firestore-key:latest"
```

### 4. Set up secrets

```bash
# Upload service account key as secret
gcloud secrets create firestore-key --data-file=./serviceAccountKey.json
```

## Frontend Deployment

### 1. Build frontend

```bash
cd client
VITE_API_URL=https://YOUR_BACKEND_URL npm run build
```

### 2. Deploy to Cloud Run (static)

Create `client/Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

Create `client/nginx.conf`:
```nginx
server {
  listen 8080;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

```bash
cd client

gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/wwwn-frontend

gcloud run deploy wwwn-frontend \
  --image gcr.io/YOUR_PROJECT_ID/wwwn-frontend \
  --platform managed \
  --region us-west1 \
  --allow-unauthenticated \
  --min-instances 0
```

## Post-Deployment

1. Update CORS in backend `.env`:
```
CORS_ORIGIN=https://YOUR_FRONTEND_URL
```

2. Update frontend API URL:
```
VITE_API_URL=https://YOUR_BACKEND_URL/api
```

3. Set up Firestore TTL policy (if not done):
   - Go to Firestore Console
   - Enable TTL on `boards` collection, field: `ttlAt`

## Cost Estimate

With Cloud Run `--min-instances=0`:
- Backend: ~$0 (free tier covers quarterly 1-hour sessions)
- Frontend: ~$0 (free tier)
- Firestore: ~$0 (free tier covers light usage)

**Total: ~$0/month for quarterly usage**

## Monitoring

View logs:
```bash
gcloud run logs read wwwn-backend --limit 50
gcloud run logs read wwwn-frontend --limit 50
```

## Rollback

```bash
gcloud run services update-traffic wwwn-backend --to-revisions PREVIOUS_REVISION=100
```
```

**Step 3: Commit**

```bash
git add .
git commit -m "docs: complete README and deployment guide"
```

---

## Plan Complete

This implementation plan provides a complete path to building the WWWN retrospective board MVP with:

✅ TDD approach with failing tests first
✅ Bite-sized tasks (2-5 minutes each)
✅ Exact file paths and commands
✅ Complete code examples
✅ Firestore integration with TTL
✅ Real-time SSE updates
✅ React frontend with Tailwind
✅ Full authentication flow (facilitator vs participant)
✅ Manual E2E testing checklist
✅ Deployment to Google Cloud Run

Each task follows the RED-GREEN-REFACTOR cycle and includes verification steps.
