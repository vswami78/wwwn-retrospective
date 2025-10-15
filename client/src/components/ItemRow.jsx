import { useState } from 'react';
import { useBoard } from '../hooks/useBoard';
import { getClientId } from '../utils/clientId';

export function ItemRow({ item }) {
  const { board, isFacilitator, addClap, removeClap, updateItem, deleteItem } = useBoard();
  const [isClapping, setIsClapping] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    starter: item.starter,
    idea: item.idea,
    who: item.who
  });
  const [hasClapped, setHasClapped] = useState(() => {
    const clapped = JSON.parse(localStorage.getItem('wwwn-clapped') || '[]');
    return clapped.includes(item.id);
  });

  const clientId = getClientId();
  const isOwnItem = item.clientId === clientId;
  const isHidden = board.gateEnabled && !board.revealed && !isFacilitator && !isOwnItem;
  const canInteractWithClap = board.revealed;

  const handleClap = async () => {
    if (!canInteractWithClap || isClapping) return;

    setIsClapping(true);
    try {
      if (hasClapped) {
        // Remove clap
        await removeClap(item.id);

        // Remove from localStorage
        const clapped = JSON.parse(localStorage.getItem('wwwn-clapped') || '[]');
        const updated = clapped.filter(id => id !== item.id);
        localStorage.setItem('wwwn-clapped', JSON.stringify(updated));
        setHasClapped(false);
      } else {
        // Add clap
        await addClap(item.id);

        // Mark as clapped in localStorage
        const clapped = JSON.parse(localStorage.getItem('wwwn-clapped') || '[]');
        clapped.push(item.id);
        localStorage.setItem('wwwn-clapped', JSON.stringify(clapped));
        setHasClapped(true);
      }
    } catch (err) {
      console.error('Failed to toggle clap:', err);
    } finally {
      setIsClapping(false);
    }
  };

  const handleEdit = () => {
    setEditData({
      starter: item.starter,
      idea: item.idea,
      who: item.who
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateItem(item.id, editData);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      starter: item.starter,
      idea: item.idea,
      who: item.who
    });
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

  if (isEditing) {
    return (
      <tr className="border-b border-gray-700 bg-gray-800/70">
        {/* Starter */}
        <td className="px-4 py-3">
          <select
            value={editData.starter}
            onChange={(e) => setEditData({...editData, starter: e.target.value})}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100"
          >
            <option value="like">I like...</option>
            <option value="wish">I wish...</option>
          </select>
        </td>

        {/* Idea */}
        <td className="px-4 py-3">
          <input
            type="text"
            value={editData.idea}
            onChange={(e) => setEditData({...editData, idea: e.target.value})}
            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100"
            placeholder="Your feedback..."
          />
        </td>

        {/* Who */}
        <td className="px-4 py-3">
          <input
            type="text"
            value={editData.who}
            onChange={(e) => setEditData({...editData, who: e.target.value})}
            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100"
            placeholder="Your name..."
          />
        </td>

        {/* Actions */}
        <td className="px-4 py-3" colSpan={isFacilitator ? 2 : 1}>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

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
          disabled={!canInteractWithClap || isClapping}
          className={`flex items-center gap-2 px-3 py-1 rounded-full transition ${
            canInteractWithClap
              ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
              : 'bg-gray-800 cursor-not-allowed'
          } ${hasClapped ? 'ring-2 ring-purple-500' : ''}`}
          title={hasClapped ? 'Click to remove your clap' : 'Clap for this'}
        >
          <span>👏</span>
          <span className="text-gray-100 font-medium">{item.claps}</span>
        </button>
      </td>

      {/* Actions (facilitator delete or own item edit) */}
      {(isFacilitator || isOwnItem) && (
        <td className="px-4 py-3">
          <div className="flex gap-2">
            {isOwnItem && !isFacilitator && (
              <button
                onClick={handleEdit}
                className="text-blue-400 hover:text-blue-300 transition"
                title="Edit your item"
              >
                ✎
              </button>
            )}
            {isFacilitator && (
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 transition"
                title="Delete item"
              >
                ✕
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}
