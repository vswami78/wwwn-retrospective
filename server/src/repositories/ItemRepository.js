import { nanoid } from 'nanoid';
import { Item } from '../models/Item.js';

export class ItemRepository {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('items');
  }

  async createItem(data) {
    const itemData = {
      id: nanoid(16),
      boardId: data.boardId,
      starter: data.starter,
      idea: data.idea,
      who: data.who,
      claps: 0,
      clientId: data.clientId,
      createdAt: new Date()
    };

    const item = new Item(itemData);
    item.validate();

    await this.collection.doc(item.id).set(item.toFirestore());

    return item;
  }

  async getItemsByBoard(boardId, since = null) {
    let query = this.collection
      .where('boardId', '==', boardId)
      .orderBy('createdAt', 'asc');

    if (since) {
      query = query.where('createdAt', '>', since);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => Item.fromFirestore(doc.id, doc.data()));
  }

  async getItem(itemId) {
    const doc = await this.collection.doc(itemId).get();

    if (!doc.exists) {
      return null;
    }

    return Item.fromFirestore(itemId, doc.data());
  }

  async getItemById(itemId) {
    return this.getItem(itemId);
  }

  async updateItem(itemId, updates) {
    const itemRef = this.collection.doc(itemId);
    const doc = await itemRef.get();

    if (!doc.exists) {
      throw new Error('Item not found');
    }

    const currentData = doc.data();
    const updatedData = {
      ...currentData,
      starter: updates.starter || currentData.starter,
      idea: updates.idea || currentData.idea,
      who: updates.who || currentData.who
    };

    const item = new Item({ id: itemId, ...updatedData });
    item.validate();

    await itemRef.update({
      starter: item.starter,
      idea: item.idea,
      who: item.who
    });

    return this.getItem(itemId);
  }

  async deleteItem(itemId) {
    await this.collection.doc(itemId).delete();
  }

  async incrementClaps(itemId) {
    const itemRef = this.collection.doc(itemId);
    await this.db.runTransaction(async (transaction) => {
      const itemDoc = await transaction.get(itemRef);
      if (!itemDoc.exists) {
        throw new Error('Item not found');
      }
      const newClaps = (itemDoc.data().claps || 0) + 1;
      transaction.update(itemRef, { claps: newClaps });
    });

    return this.getItem(itemId);
  }

  async decrementClaps(itemId) {
    const itemRef = this.collection.doc(itemId);
    await this.db.runTransaction(async (transaction) => {
      const itemDoc = await transaction.get(itemRef);
      if (!itemDoc.exists) {
        throw new Error('Item not found');
      }
      const newClaps = Math.max(0, (itemDoc.data().claps || 0) - 1);
      transaction.update(itemRef, { claps: newClaps });
    });

    return this.getItem(itemId);
  }
}
