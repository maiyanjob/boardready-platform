import React from 'react';
import { Card, Title, Text } from '@tremor/react';

const BoardExpertiseHeatmap = ({ gaps, projectId }) => {
  // Get unique directors from all gaps
  const directorsMap = new Map();
  
  gaps.forEach(gap => {
    if (gap.members_with && gap.members_with.length > 0) {
      gap.members_with.forEach(director => {
        if (!directorsMap.has(director)) {
          directorsMap.set(director, new Set());
        }
        directorsMap.get(director).add(gap.gap_title);
      });
    }
  });

  const directors = Array.from(directorsMap.keys()).sort();
  
  // Calculate expertise score (1-5) for each director-gap combination
  const getExpertiseScore = (director, gapTitle) => {
    const directorGaps = directorsMap.get(director);
    if (!directorGaps || !directorGaps.has(gapTitle)) return 0;
    
    // For now, simple binary: has expertise = 4/5
    // TODO: Use Claude to score 1-5 based on bio depth
    return 4;
  };

  const getScoreColor = (score) => {
    if (score === 0) return 'bg-slate-800';
    if (score === 1) return 'bg-red-900';
    if (score === 2) return 'bg-orange-700';
    if (score === 3) return 'bg-yellow-600';
    if (score === 4) return 'bg-emerald-600';
    if (score === 5) return 'bg-emerald-500';
    return 'bg-slate-800';
  };

  const getScoreLabel = (score) => {
    if (score === 0) return 'No Expertise';
    if (score === 1) return 'Minimal';
    if (score === 2) return 'Basic';
    if (score === 3) return 'Moderate';
    if (score === 4) return 'Strong';
    if (score === 5) return 'Expert';
    return 'Unknown';
  };

  return (
    <Card>
      <Title>Board Skills Matrix (Expertise Heatmap)</Title>
      <Text className="mb-4">Hover over cells to see expertise depth</Text>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-slate-900 p-3 text-left text-sm font-semibold text-white border-b border-slate-700 min-w-[180px]">
                Director
              </th>
              {gaps.map((gap, idx) => (
                <th 
                  key={idx}
                  className="p-3 text-left text-xs font-medium text-slate-300 border-b border-slate-700 min-w-[100px]"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                  {gap.gap_title.substring(0, 25)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {directors.map((director, dirIdx) => (
              <tr key={dirIdx} className="border-b border-slate-800">
                <td className="sticky left-0 bg-slate-900 p-3 text-sm font-medium text-white">
                  {director}
                </td>
                {gaps.map((gap, gapIdx) => {
                  const score = getExpertiseScore(director, gap.gap_title);
                  return (
                    <td 
                      key={gapIdx}
                      className="p-1"
                    >
                      <div
                        className={`h-12 w-full rounded ${getScoreColor(score)} transition-all hover:ring-2 hover:ring-blue-500 cursor-pointer flex items-center justify-center`}
                        title={`${director} - ${gap.gap_title}: ${getScoreLabel(score)}`}
                      >
                        {score > 0 && (
                          <span className="text-xs font-bold text-white">{score}</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-300">
        <span className="font-semibold text-slate-200">Expertise Level:</span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-slate-800 rounded"></div>
          <span className="text-slate-300">0 - None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-red-900 rounded"></div>
          <span className="text-slate-300">1 - Minimal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-orange-700 rounded"></div>
          <span className="text-slate-300">2 - Basic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-yellow-600 rounded"></div>
          <span className="text-slate-300">3 - Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-emerald-600 rounded"></div>
          <span className="text-slate-300">4 - Strong</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-emerald-500 rounded"></div>
          <span className="text-slate-300">5 - Expert</span>
        </div>
      </div>
    </Card>
  );
};

export default BoardExpertiseHeatmap;
