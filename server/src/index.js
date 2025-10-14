import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { boardRoutes } from './routes/boardRoutes.js';
import { itemRoutes } from './routes/itemRoutes.js';
import { clapRoutes } from './routes/clapRoutes.js';
import { eventsRoutes } from './routes/eventsRoutes.js';
import { exportRoutes } from './routes/exportRoutes.js';
import { sseService } from './services/SSEService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Make sseService available to routes
app.set('sseService', sseService);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/boards', boardRoutes);
app.use('/api/boards/:boardId/items', itemRoutes);
app.use('/api/boards/:boardId/items/:itemId/clap', clapRoutes);
app.use('/api/boards/:boardId/events', eventsRoutes);
app.use('/api/boards/:boardId/export.csv', exportRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
