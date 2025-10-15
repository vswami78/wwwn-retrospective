import { useState, useMemo } from 'react';
import { useBoard } from '../hooks/useBoard';
import { ItemRow } from './ItemRow';

export function ItemTable() {
  const { items, isFacilitator } = useBoard();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('claps'); // 'claps' | 'time'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const filteredAndSortedItems = useMemo(() => {
    // First filter by search
    let filtered = items;
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = items.filter(item =>
        item.idea.toLowerCase().includes(query) ||
        item.who.toLowerCase().includes(query)
      );
    }

    // Then sort
    const sorted = [...filtered];
    if (sortBy === 'claps') {
      sorted.sort((a, b) => {
        const diff = (b.claps || 0) - (a.claps || 0);
        return sortOrder === 'desc' ? diff : -diff;
      });
    } else if (sortBy === 'time') {
      sorted.sort((a, b) => {
        const diff = new Date(b.createdAt) - new Date(a.createdAt);
        return sortOrder === 'desc' ? diff : -diff;
      });
    }

    return sorted;
  }, [items, search, sortBy, sortOrder]);

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Search box */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by idea or name..."
          className="w-64 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Starter</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Idea</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Who</th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-200 select-none"
                onClick={() => toggleSort('claps')}
                title="Click to sort by clap count"
              >
                <div className="flex items-center gap-2">
                  <span>Clap</span>
                  {sortBy === 'claps' && (
                    <span className="text-purple-400">
                      {sortOrder === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </div>
              </th>
              {isFacilitator && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedItems.length === 0 ? (
              <tr>
                <td colSpan={isFacilitator ? 5 : 4} className="px-4 py-8 text-center text-gray-500">
                  {search ? 'No items match your search' : 'No items yet. Add one below!'}
                </td>
              </tr>
            ) : (
              filteredAndSortedItems.map(item => (
                <ItemRow key={item.id} item={item} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
