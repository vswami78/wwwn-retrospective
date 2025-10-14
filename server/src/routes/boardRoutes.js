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

    // Broadcast reveal-changed event via SSE
    const sseService = req.app.get('sseService');
    sseService.broadcast(req.params.id, 'reveal-changed', { revealed });

    res.json(updated);
  } catch (error) {
    console.error('Error updating reveal:', error);
    res.status(500).json({ error: 'Failed to update reveal' });
  }
});

export { router as boardRoutes };
