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

    // Broadcast item-added event via SSE
    const sseService = req.app.get('sseService');
    sseService.broadcast(boardId, 'item-added', item);

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
