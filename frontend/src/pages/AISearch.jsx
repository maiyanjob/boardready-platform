import { useState } from 'react';
import { searchCandidates, searchBoards } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { Button } from '../components/ui/button';

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'candidates', 'boards'
  const [candidateResults, setCandidateResults] = useState([]);
  const [boardResults, setBoardResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      if (searchType === 'all' || searchType === 'candidates') {
        const candidateResponse = await searchCandidates(query, 5);
        setCandidateResults(candidateResponse.data.results);
      } else {
        setCandidateResults([]);
      }
      
      if (searchType === 'all' || searchType === 'boards') {
        const boardResponse = await searchBoards(query, 5);
        setBoardResults(boardResponse.data.results);
      } else {
        setBoardResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-2">🔍 AI Semantic Search</h1>
        <p className="text-gray-600 mb-6">
          Search candidates and boards using natural language. The AI understands context, not just keywords.
        </p>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Try: "Find CFO with fintech experience" or "Tech companies needing cloud expertise"'
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
            />
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-8"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setSearchType('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                searchType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => setSearchType('candidates')}
              className={`px-4 py-2 rounded-md transition-colors ${
                searchType === 'candidates'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Candidates Only
            </button>
            <button
              onClick={() => setSearchType('boards')}
              className={`px-4 py-2 rounded-md transition-colors ${
                searchType === 'boards'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Boards Only
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 p-8 rounded-lg text-center">
            <div className="animate-pulse">
              <p className="text-blue-600 font-semibold text-lg">🧠 AI is analyzing...</p>
              <p className="text-sm text-blue-500 mt-2">
                Using semantic search to find the best matches
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <div className="space-y-6">
            {/* Candidate Results */}
            {(searchType === 'all' || searchType === 'candidates') && candidateResults.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  👥 Candidates ({candidateResults.length} matches)
                </h2>
                <div className="space-y-3">
                  {candidateResults.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-blue-600">
                              #{index + 1}
                            </span>
                            <h3 className="text-xl font-semibold">{candidate.name}</h3>
                          </div>
                          <p className="text-gray-600 mt-1">
                            {candidate.title} at {candidate.company}
                          </p>
                          <p className="text-gray-700 mt-2">{candidate.bio}</p>
                          <div className="flex gap-4 mt-3 text-sm text-gray-600">
                            <span>📊 {candidate.years_experience} years</span>
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

            {/* Board Results */}
            {(searchType === 'all' || searchType === 'boards') && boardResults.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  🏢 Boards ({boardResults.length} matches)
                </h2>
                <div className="space-y-3">
                  {boardResults.map((board, index) => (
                    <div
                      key={board.id}
                      className="bg-white p-5 rounded-lg border-2 border-gray-200 hover:border-green-400 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-green-600">
                              #{index + 1}
                            </span>
                            <h3 className="text-xl font-semibold">{board.company_name}</h3>
                            {board.ticker && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-mono">
                                {board.ticker}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{board.sector}</p>
                          <p className="text-gray-700 mt-2">{board.description}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {candidateResults.length === 0 && boardResults.length === 0 && (
              <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                <p className="text-lg">No results found for "{query}"</p>
                <p className="text-sm mt-2">Try a different search term or add more data to your database.</p>
              </div>
            )}
          </div>
        )}

        {/* Example Queries */}
        {!searched && (
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3">💡 Try These Example Searches:</h3>
            <div className="space-y-2">
              <button
                onClick={() => setQuery('Find executives with cloud computing experience')}
                className="block w-full text-left px-4 py-2 bg-white rounded hover:bg-purple-100 transition-colors"
              >
                "Find executives with cloud computing experience"
              </button>
              <button
                onClick={() => setQuery('CFO with banking and M&A expertise')}
                className="block w-full text-left px-4 py-2 bg-white rounded hover:bg-purple-100 transition-colors"
              >
                "CFO with banking and M&A expertise"
              </button>
              <button
                onClick={() => setQuery('Technology companies needing digital transformation')}
                className="block w-full text-left px-4 py-2 bg-white rounded hover:bg-purple-100 transition-colors"
              >
                "Technology companies needing digital transformation"
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
