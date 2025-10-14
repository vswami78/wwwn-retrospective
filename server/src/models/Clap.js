export class Clap {
  constructor(data) {
    this.id = data.id;
    this.boardId = data.boardId;
    this.itemId = data.itemId;
    this.clientId = data.clientId;
    this.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
  }

  toFirestore() {
    return {
      boardId: this.boardId,
      itemId: this.itemId,
      clientId: this.clientId,
      createdAt: this.createdAt
    };
  }

  static fromFirestore(id, data) {
    return new Clap({
      id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt
    });
  }
}
