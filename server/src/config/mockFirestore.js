// In-memory mock Firestore for testing without Firebase credentials

class MockDocumentReference {
  constructor(collection, id) {
    this.collection = collection;
    this.id = id;
  }

  async set(data) {
    this.collection.data.set(this.id, { ...data, _id: this.id });
    return;
  }

  async get() {
    const data = this.collection.data.get(this.id);
    return {
      exists: !!data,
      id: this.id,
      data: () => {
        if (!data) return null;
        const { _id, ...rest } = data;
        return rest;
      }
    };
  }

  async update(updates) {
    const existing = this.collection.data.get(this.id);
    if (existing) {
      this.collection.data.set(this.id, { ...existing, ...updates });
    }
    return;
  }

  async delete() {
    this.collection.data.delete(this.id);
    return;
  }
}

class MockQuery {
  constructor(collection, filters = []) {
    this.collection = collection;
    this.filters = filters;
  }

  where(field, op, value) {
    return new MockQuery(this.collection, [...this.filters, { field, op, value }]);
  }

  orderBy(field, direction = 'asc') {
    return new MockQuery(this.collection, [...this.filters, { type: 'orderBy', field, direction }]);
  }

  async get() {
    let results = Array.from(this.collection.data.values());

    // Apply where filters
    this.filters.forEach(filter => {
      if (filter.type === 'orderBy') {
        results.sort((a, b) => {
          const aVal = a[filter.field];
          const bVal = b[filter.field];
          if (filter.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      } else {
        results = results.filter(doc => {
          const docVal = doc[filter.field];
          switch (filter.op) {
            case '==':
              return docVal === filter.value;
            case '>':
              return docVal > filter.value;
            case '<':
              return docVal < filter.value;
            case '>=':
              return docVal >= filter.value;
            case '<=':
              return docVal <= filter.value;
            default:
              return true;
          }
        });
      }
    });

    return {
      docs: results.map(doc => ({
        id: doc._id,
        data: () => {
          const { _id, ...rest } = doc;
          return rest;
        }
      })),
      empty: results.length === 0
    };
  }
}

class MockCollectionReference {
  constructor(name) {
    this.name = name;
    this.data = new Map();
  }

  doc(id) {
    return new MockDocumentReference(this, id);
  }

  where(field, op, value) {
    return new MockQuery(this, [{ field, op, value }]);
  }
}

class MockFirestore {
  constructor() {
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MockCollectionReference(name));
    }
    return this.collections.get(name);
  }

  async runTransaction(updateFunction) {
    // Simple implementation - just run the function
    const transaction = {
      get: async (ref) => ref.get(),
      update: async (ref, data) => ref.update(data),
      set: async (ref, data) => ref.set(data),
      delete: async (ref) => ref.delete()
    };
    return updateFunction(transaction);
  }
}

export const db = new MockFirestore();
export const BOARD_TTL_DAYS = 7;

console.log('⚠️  Using in-memory mock Firestore (no persistence)');
