import { useParams, useSearchParams } from 'react-router-dom';
import { BoardProvider } from '../context/BoardContext';
import { BoardHeader } from '../components/BoardHeader';
import { ItemTable } from '../components/ItemTable';
import { ItemComposer } from '../components/ItemComposer';
import { useBoard } from '../hooks/useBoard';

function BoardContent() {
  const { loading, error, isFacilitator, exportCSV } = useBoard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <BoardHeader />

      <main className="flex-1 py-8">
        <ItemTable />
      </main>

      <ItemComposer />

      {isFacilitator && (
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex justify-end">
            <button
              onClick={exportCSV}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              Export CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BoardPage() {
  const { boardId } = useParams();
  const [searchParams] = useSearchParams();
  const facilitatorToken = searchParams.get('token');

  return (
    <BoardProvider boardId={boardId} facilitatorToken={facilitatorToken}>
      <BoardContent />
    </BoardProvider>
  );
}
