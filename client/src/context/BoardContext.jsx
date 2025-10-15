import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiClient } from '../services/api';
import { getClientId } from '../utils/clientId';

const BoardContext = createContext(null);

export function BoardProvider({ children, boardId, facilitatorToken }) {
  const [board, setBoard] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api] = useState(() => {
    const clientId = getClientId();
    return new ApiClient(import.meta.env.VITE_API_URL || 'http://localhost:3001/api', clientId, facilitatorToken);
  });

  const isFacilitator = !!facilitatorToken;

  // Load board and items
  useEffect(() => {
    if (!boardId) return;

    async function loadBoard() {
      try {
        setLoading(true);
        const [boardData, itemsData] = await Promise.all([
          api.getBoard(boardId),
          api.getItems(boardId)
        ]);
        setBoard(boardData);
        setItems(itemsData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadBoard();
  }, [boardId, api]);

  // Connect to SSE
  useEffect(() => {
    if (!boardId) return;

    const eventSource = api.connectSSE(boardId, (event, data) => {
      if (event === 'item-added') {
        setItems(prev => [...prev, data]);
      } else if (event === 'item-updated') {
        setItems(prev => prev.map(item =>
          item.id === data.id ? data : item
        ));
      } else if (event === 'item-clapped') {
        setItems(prev => prev.map(item =>
          item.id === data.id ? data : item
        ));
      } else if (event === 'reveal-changed') {
        setBoard(prev => ({ ...prev, revealed: data.revealed }));
      }
    });

    return () => {
      eventSource.close();
    };
  }, [boardId, api]);

  const addItem = useCallback(async (itemData) => {
    try {
      const item = await api.createItem(boardId, itemData);
      // Item will be added via SSE event
      return item;
    } catch (err) {
      throw new Error(err.message);
    }
  }, [boardId, api]);

  const addClap = useCallback(async (itemId) => {
    try {
      await api.addClap(boardId, itemId);
      // Item will be updated via SSE event
    } catch (err) {
      throw new Error(err.message);
    }
  }, [boardId, api]);

  const removeClap = useCallback(async (itemId) => {
    try {
      await api.removeClap(boardId, itemId);
      // Item will be updated via SSE event
    } catch (err) {
      throw new Error(err.message);
    }
  }, [boardId, api]);

  const toggleReveal = useCallback(async (revealed) => {
    try {
      await api.toggleReveal(boardId, revealed);
      // Board will be updated via SSE event
    } catch (err) {
      throw new Error(err.message);
    }
  }, [boardId, api]);

  const updateItem = useCallback(async (itemId, itemData) => {
    try {
      await api.updateItem(boardId, itemId, itemData);
      // Item will be updated via SSE event
    } catch (err) {
      throw new Error(err.message);
    }
  }, [boardId, api]);

  const deleteItem = useCallback(async (itemId) => {
    try {
      await api.deleteItem(boardId, itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      throw new Error(err.message);
    }
  }, [boardId, api]);

  const exportCSV = useCallback(() => {
    const url = api.getExportUrl(boardId);
    window.open(url, '_blank');
  }, [boardId, api]);

  const value = {
    board,
    items,
    loading,
    error,
    isFacilitator,
    addItem,
    updateItem,
    addClap,
    removeClap,
    toggleReveal,
    deleteItem,
    exportCSV
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within BoardProvider');
  }
  return context;
}
