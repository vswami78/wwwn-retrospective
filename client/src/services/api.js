export class ApiClient {
  constructor(baseUrl, clientId, facilitatorToken = null) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
    this.facilitatorToken = facilitatorToken;
  }

  getHeaders(includeClientId = true) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (includeClientId) {
      headers['x-client-id'] = this.clientId;
    }

    if (this.facilitatorToken) {
      headers['x-facilitator-token'] = this.facilitatorToken;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(options.includeClientId !== false),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // Board endpoints
  async createBoard() {
    return this.request('/boards', {
      method: 'POST',
      includeClientId: false
    });
  }

  async getBoard(boardId) {
    return this.request(`/boards/${boardId}`, {
      includeClientId: false
    });
  }

  async toggleReveal(boardId, revealed) {
    return this.request(`/boards/${boardId}/reveal`, {
      method: 'POST',
      body: JSON.stringify({ revealed })
    });
  }

  // Item endpoints
  async createItem(boardId, itemData) {
    return this.request(`/boards/${boardId}/items`, {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  }

  async getItems(boardId, since = null) {
    const query = since ? `?since=${since.toISOString()}` : '';
    return this.request(`/boards/${boardId}/items${query}`);
  }

  async updateItem(boardId, itemId, itemData) {
    return this.request(`/boards/${boardId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  }

  async deleteItem(boardId, itemId) {
    return this.request(`/boards/${boardId}/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  // Clap endpoints
  async addClap(boardId, itemId) {
    return this.request(`/boards/${boardId}/items/${itemId}/clap`, {
      method: 'POST'
    });
  }

  async removeClap(boardId, itemId) {
    return this.request(`/boards/${boardId}/items/${itemId}/clap`, {
      method: 'DELETE'
    });
  }

  // SSE connection
  connectSSE(boardId, onMessage) {
    const url = `${this.baseUrl}/boards/${boardId}/events`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage('message', data);
    };

    eventSource.addEventListener('item-added', (event) => {
      const data = JSON.parse(event.data);
      onMessage('item-added', data);
    });

    eventSource.addEventListener('item-updated', (event) => {
      const data = JSON.parse(event.data);
      onMessage('item-updated', data);
    });

    eventSource.addEventListener('item-clapped', (event) => {
      const data = JSON.parse(event.data);
      onMessage('item-clapped', data);
    });

    eventSource.addEventListener('reveal-changed', (event) => {
      const data = JSON.parse(event.data);
      onMessage('reveal-changed', data);
    });

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return eventSource;
  }

  // Export
  getExportUrl(boardId) {
    return `${this.baseUrl}/boards/${boardId}/export.csv`;
  }
}
