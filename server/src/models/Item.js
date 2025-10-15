export class Item {
  constructor(data) {
    this.id = data.id;
    this.boardId = data.boardId;
    this.starter = data.starter; // 'like' | 'wish'
    this.idea = data.idea;
    this.who = data.who;
    this.claps = data.claps ?? 0;
    this.clientId = data.clientId; // Track item owner
    this.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
  }

  toFirestore() {
    return {
      boardId: this.boardId,
      starter: this.starter,
      idea: this.idea,
      who: this.who,
      claps: this.claps,
      clientId: this.clientId,
      createdAt: this.createdAt
    };
  }

  static fromFirestore(id, data) {
    return new Item({
      id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt
    });
  }

  validate() {
    if (!['like', 'wish'].includes(this.starter)) {
      throw new Error('Invalid starter: must be "like" or "wish"');
    }
    if (!this.idea || this.idea.length < 1 || this.idea.length > 200) {
      throw new Error('Idea must be 1-200 characters');
    }
    if (!this.who || this.who.length < 1 || this.who.length > 60) {
      throw new Error('Who must be 1-60 characters');
    }
  }
}
