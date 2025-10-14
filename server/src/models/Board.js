export class Board {
  constructor(data) {
    this.id = data.id;
    this.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
    this.revealed = data.revealed ?? false;
    this.gateEnabled = data.gateEnabled ?? true;
    this.ttlAt = data.ttlAt instanceof Date ? data.ttlAt : new Date(data.ttlAt);
    this.facilitatorToken = data.facilitatorToken;
  }

  toFirestore() {
    return {
      createdAt: this.createdAt,
      revealed: this.revealed,
      gateEnabled: this.gateEnabled,
      ttlAt: this.ttlAt,
      facilitatorToken: this.facilitatorToken
    };
  }

  static fromFirestore(id, data) {
    return new Board({
      id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      ttlAt: data.ttlAt?.toDate?.() || data.ttlAt
    });
  }
}
