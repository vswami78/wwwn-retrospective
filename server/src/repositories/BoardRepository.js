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
