import { useEffect, useState } from 'react';
import { getCandidates } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { Button } from '../components/ui/button';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await getCandidates();
        setCandidates(response.data.candidates);
      } catch (error) {
        console.error('Failed to fetch candidates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <p>Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Candidates</h1>
          <Button>+ Add Candidate</Button>
        </div>

        <div className="grid gap-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {candidate.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {candidate.title} at {candidate.company}
                  </p>
                  
                  <p className="text-gray-700 mt-3 line-clamp-2">
                    {candidate.bio}
                  </p>

                  <div className="flex gap-4 mt-4 text-sm text-gray-600">
                    <span>📊 {candidate.years_experience} years experience</span>
                    <span>🎯 {candidate.board_count} boards</span>
                  </div>

                  {candidate.industries && candidate.industries.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {candidate.industries.map((industry, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  )}

                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {candidate.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 4 && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                          +{candidate.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No candidates yet. Add your first candidate to get started!
          </div>
        )}
      </div>
    </div>
  );
}
