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
