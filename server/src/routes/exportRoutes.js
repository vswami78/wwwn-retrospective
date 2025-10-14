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
