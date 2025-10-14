import { useState } from 'react';
import { useBoard } from '../hooks/useBoard';

export function ItemRow({ item }) {
  const { board, isFacilitator, addClap, deleteItem } = useBoard();
  const [isClapping, setIsClapping] = useState(false);
  const [hasClapped, setHasClapped] = useState(() => {
    const clapped = JSON.parse(localStorage.getItem('wwwn-clapped') || '[]');
    return clapped.includes(item.id);
  });

  const isHidden = board.gateEnabled && !board.revealed && !isFacilitator;
  const canClap = board.revealed && !hasClapped;

  const handleClap = async () => {
    if (!canClap || isClapping) return;

    setIsClapping(true);
    try {
      await addClap(item.id);

      // Mark as clapped in localStorage
      const clapped = JSON.parse(localStorage.getItem('wwwn-clapped') || '[]');
      clapped.push(item.id);
      localStorage.setItem('wwwn-clapped', JSON.stringify(clapped));
      setHasClapped(true);
    } catch (err) {
      console.error('Failed to clap:', err);
    } finally {
      setIsClapping(false);
    }
  };

  const handleDelete = async () => {
    if (!isFacilitator) return;

    if (confirm('Delete this item?')) {
      try {
        await deleteItem(item.id);
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition">
      {/* Starter */}
      <td className="px-4 py-3">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          item.starter === 'like'
            ? 'bg-like/20 text-like'
            : 'bg-wish/20 text-wish'
        }`}>
          {item.starter === 'like' ? 'I like...' : 'I wish...'}
        </span>
      </td>

      {/* Idea */}
      <td className="px-4 py-3">
        {isHidden ? (
          <span className="text-gray-500 italic">Hidden until reveal</span>
        ) : (
          <span className="text-gray-100">{item.idea}</span>
        )}
      </td>

      {/* Who */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-medium">
            {getInitials(item.who)}
          </div>
          <span className="text-gray-300">{item.who}</span>
        </div>
      </td>

      {/* Clap */}
      <td className="px-4 py-3">
        <button
          onClick={handleClap}
          disabled={!canClap || isClapping}
          className={`flex items-center gap-2 px-3 py-1 rounded-full transition ${
            canClap
              ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
              : 'bg-gray-800 cursor-not-allowed'
          } ${hasClapped ? 'ring-2 ring-purple-500' : ''}`}
          title={hasClapped ? 'Already clapped' : 'Clap for this'}
        >
          <span>👏</span>
          <span className="text-gray-100 font-medium">{item.claps}</span>
        </button>
      </td>

      {/* Delete (facilitator only) */}
      {isFacilitator && (
        <td className="px-4 py-3">
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 transition"
            title="Delete item"
          >
            ✕
          </button>
        </td>
      )}
    </tr>
  );
}
