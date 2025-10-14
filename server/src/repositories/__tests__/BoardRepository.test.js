import { describe, test, expect, beforeEach, jest } from '@jest/globals';
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
});
