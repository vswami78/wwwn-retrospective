export class SSEService {
  constructor() {
    this.clients = new Map(); // boardId -> Set of response objects
  }

  addClient(boardId, res) {
    if (!this.clients.has(boardId)) {
      this.clients.set(boardId, new Set());
    }

    this.clients.get(boardId).add(res);

    console.log(`Client connected to board ${boardId}. Total clients: ${this.clients.get(boardId).size}`);
  }

  removeClient(boardId, res) {
    if (this.clients.has(boardId)) {
      this.clients.get(boardId).delete(res);

      if (this.clients.get(boardId).size === 0) {
        this.clients.delete(boardId);
      }

      console.log(`Client disconnected from board ${boardId}`);
    }
  }

  broadcast(boardId, event, data) {
    if (!this.clients.has(boardId)) {
      return;
    }

    const clients = this.clients.get(boardId);
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    clients.forEach(client => {
      try {
        client.write(message);
      } catch (error) {
        console.error('Error broadcasting to client:', error);
        this.removeClient(boardId, client);
      }
    });
  }

  sendToClient(res, event, data) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    res.write(message);
  }
}

export const sseService = new SSEService();
