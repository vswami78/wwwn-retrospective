import { nanoid } from 'nanoid';
import { Clap } from '../models/Clap.js';

export class ClapRepository {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('claps');
  }

  async addClap(data) {
    const clapData = {
      id: nanoid(16),
      boardId: data.boardId,
      itemId: data.itemId,
      clientId: data.clientId,
      createdAt: new Date()
    };

    const clap = new Clap(clapData);
    await this.collection.doc(clap.id).set(clap.toFirestore());

    return clap;
  }

  async hasClientClapped(itemId, clientId) {
    const snapshot = await this.collection
      .where('itemId', '==', itemId)
      .where('clientId', '==', clientId)
      .get();

    return !snapshot.empty;
  }

  async removeClap(itemId, clientId) {
    const snapshot = await this.collection
      .where('itemId', '==', itemId)
      .where('clientId', '==', clientId)
      .get();

    if (snapshot.empty) {
      throw new Error('Clap not found');
    }

    // Delete the clap record
    await snapshot.docs[0].ref.delete();
  }

  async getClapsForItem(itemId) {
    const snapshot = await this.collection
      .where('itemId', '==', itemId)
      .get();

    return snapshot.docs.map(doc => Clap.fromFirestore(doc.id, doc.data()));
  }
}
