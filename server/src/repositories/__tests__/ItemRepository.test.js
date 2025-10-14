import { describe, test, expect, beforeEach, jest } from '@jest/globals';
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

  test('createItem validates who length', async () => {
    const itemData = {
      boardId: 'board123',
      starter: 'like',
      idea: 'Test idea',
      who: 'x'.repeat(61)
    };

    await expect(repo.createItem(itemData)).rejects.toThrow('Who must be 1-60 characters');
  });
});
