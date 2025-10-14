import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '../services/api';
import { getClientId } from '../utils/clientId';

export function HomePage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateBoard = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const clientId = getClientId();
      const api = new ApiClient(import.meta.env.VITE_API_URL || 'http://localhost:3001/api', clientId);
      const board = await api.createBoard();

      // Navigate to board as facilitator
      navigate(`/board/${board.id}?token=${board.facilitatorToken}`);
    } catch (err) {
      setError(err.message);
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">WWWN</h1>
          <h2 className="text-2xl text-gray-400 mb-2">I Like / I Wish</h2>
          <p className="text-gray-500">
            A simple retrospective board for collecting feedback
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <button
            onClick={handleCreateBoard}
            disabled={isCreating}
            className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-medium text-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isCreating ? 'Creating Board...' : 'Create New Board'}
          </button>

          {error && (
            <div className="mt-4 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm text-center">
              Or join an existing board by entering the URL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
