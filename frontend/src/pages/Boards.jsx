import { useEffect, useState } from 'react';
import { getBoards } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { Button } from '../components/ui/button';

export default function Boards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await getBoards();
        setBoards(response.data.boards);
      } catch (error) {
        console.error('Failed to fetch boards:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <p>Loading boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Boards</h1>
          <Button>+ Add Board</Button>
        </div>

        <div className="grid gap-4">
          {boards.map((board) => (
            <div
              key={board.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {board.company_name}
                    </h3>
                    {board.ticker && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-mono">
                        {board.ticker}
                      </span>
                    )}
                  </div>
                  
                  {board.sector && (
                    <p className="text-gray-600 mt-1">
                      {board.sector}
                    </p>
                  )}

                  <p className="text-gray-700 mt-3">
                    {board.description}
                  </p>

                  {board.last_proxy_date && (
                    <p className="text-sm text-gray-500 mt-3">
                      Last Proxy: {new Date(board.last_proxy_date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Match Candidates
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {boards.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No boards yet. Add your first board to get started!
          </div>
        )}
      </div>
    </div>
  );
}
