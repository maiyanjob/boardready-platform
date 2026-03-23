import { useEffect, useState } from 'react';
import { getBoards, matchCandidatesToBoard } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { Button } from '../components/ui/button';

export default function Match() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await getBoards();
        setBoards(response.data.boards);
      } catch (error) {
        console.error('Failed to fetch boards:', error);
      }
    };
    fetchBoards();
  }, []);

  const handleMatch = async (boardId) => {
    setLoading(true);
    setSelectedBoard(boardId);
    
    try {
      const response = await matchCandidatesToBoard(boardId, 5);
      setMatches(response.data.matched_candidates);
    } catch (error) {
      console.error('Failed to match candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedBoardData = boards.find(b => b.id === selectedBoard);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">AI Candidate Matching</h1>

        <div className="grid grid-cols-2 gap-8">
          {/* Left: Select Board */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select a Board</h2>
            <div className="space-y-3">
              {boards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => handleMatch(board.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedBoard === board.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{board.company_name}</h3>
                    {board.ticker && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-mono">
                        {board.ticker}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{board.sector}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI Matched Candidates */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              🤖 AI Matched Candidates
            </h2>

            {!selectedBoard && (
              <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                <p className="text-lg">👈 Select a board to see AI-matched candidates</p>
              </div>
            )}

            {loading && (
              <div className="bg-blue-50 p-8 rounded-lg text-center">
                <div className="animate-pulse">
                  <p className="text-blue-600 font-semibold">🧠 AI is analyzing...</p>
                  <p className="text-sm text-blue-500 mt-2">Matching candidates using semantic search</p>
                </div>
              </div>
            )}

            {!loading && selectedBoard && selectedBoardData && (
              <div>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-900">
                    <strong>Matching for:</strong> {selectedBoardData.company_name}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    AI found {matches.length} candidates with relevant experience
                  </p>
                </div>

                <div className="space-y-3">
                  {matches.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-green-400 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600">
                              #{index + 1}
                            </span>
                            <h3 className="font-semibold">{candidate.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            {candidate.title} at {candidate.company}
                          </p>
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                            {candidate.bio}
                          </p>
                          <div className="flex gap-3 mt-2 text-xs text-gray-600">
                            <span>📊 {candidate.years_experience} yrs</span>
                            <span>🎯 {candidate.board_count} boards</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">
            🧠 How AI Matching Works
          </h3>
          <p className="text-sm text-purple-800">
            Our AI uses semantic embeddings powered by Claude to understand the meaning 
            of board requirements and candidate experience. It matches based on context, 
            not just keywords - finding the best fit even when exact terms don't match.
          </p>
        </div>
      </div>
    </div>
  );
}
