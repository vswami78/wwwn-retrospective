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
