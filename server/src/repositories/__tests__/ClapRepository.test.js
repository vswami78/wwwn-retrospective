import { describe, test, expect, beforeEach, jest } from '@jest/globals';
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
