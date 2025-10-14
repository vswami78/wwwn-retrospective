import { useBoard } from '../hooks/useBoard';

export function BoardHeader() {
  const { board, isFacilitator, toggleReveal } = useBoard();

  if (!board) return null;

  const handleToggleReveal = (e) => {
    toggleReveal(e.target.checked);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">
          WWWN Retrospective Board
        </h1>

        {isFacilitator && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={board.revealed}
                onChange={handleToggleReveal}
                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-gray-300">
                ☑ Check to view all answers once everyone is finished adding feedback
              </span>
            </label>
          </div>
        )}

        {!isFacilitator && board.gateEnabled && !board.revealed && (
          <div className="text-gray-400 text-sm">
            Waiting for facilitator to reveal responses...
          </div>
        )}
      </div>
    </header>
  );
}
