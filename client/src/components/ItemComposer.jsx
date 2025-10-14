import { useState } from 'react';
import { useBoard } from '../hooks/useBoard';

export function ItemComposer() {
  const { addItem } = useBoard();
  const [starter, setStarter] = useState('like');
  const [idea, setIdea] = useState('');
  const [who, setWho] = useState(() => {
    return localStorage.getItem('wwwn-last-who') || '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idea.trim() || !who.trim()) {
      setError('Please fill in both fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addItem({
        starter,
        idea: idea.trim(),
        who: who.trim()
      });

      // Clear idea but keep who
      setIdea('');
      localStorage.setItem('wwwn-last-who', who.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        <div className="flex gap-4 items-end">
          {/* Sentence starters */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStarter('like')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                starter === 'like'
                  ? 'bg-like text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              I like...
            </button>
            <button
              type="button"
              onClick={() => setStarter('wish')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                starter === 'wish'
                  ? 'bg-wish text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              I wish...
            </button>
          </div>

          {/* Idea input */}
          <div className="flex-1">
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Your idea (up to 200 characters)"
              maxLength={200}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Who input */}
          <div className="w-48">
            <input
              type="text"
              value={who}
              onChange={(e) => setWho(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || !idea.trim() || !who.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </div>

        {error && (
          <div className="mt-2 text-red-400 text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
