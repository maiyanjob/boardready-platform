import { motion } from 'framer-motion';
import { Download, FileSpreadsheet } from 'lucide-react';

export default function BoardMatrix({ boardMembers }) {
  
  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      'Name', 'Organization', 'Position', 'Gender', 'Age Range', 
      'Race/Ethnicity', 'Sector', 'Expertise', 'Geography'
    ];
    
    const rows = boardMembers.map(member => [
      member.name,
      member.organization,
      member.position,
      member.matrix_data?.demographics?.gender || '',
      member.matrix_data?.demographics?.age_range || '',
      member.matrix_data?.demographics?.race_ethnicity || '',
      member.matrix_data?.professional?.sector || '',
      (member.matrix_data?.professional?.expertise || []).join('; '),
      member.matrix_data?.geography?.primary_location || ''
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `board-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Board Profile Matrix</h2>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 
            transition-colors flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </button>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-slate-800 rounded-2xl">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-900 px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider border-r border-slate-800">
                    Board Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Age Range
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Race/Ethnicity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Sector
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Primary Expertise
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Geography
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Years on Board
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-950 divide-y divide-slate-800">
                {boardMembers.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="sticky left-0 z-10 bg-slate-950 hover:bg-slate-900/50 px-6 py-4 whitespace-nowrap border-r border-slate-800">
                      <div className="text-sm font-bold text-white">{member.name}</div>
                      <div className="text-xs text-slate-400">{member.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{member.organization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        member.matrix_data?.demographics?.gender === 'Female'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}>
                        {member.matrix_data?.demographics?.gender || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300">
                        {member.matrix_data?.demographics?.age_range || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        member.matrix_data?.demographics?.race_ethnicity === 'Caucasian'
                          ? 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {member.matrix_data?.demographics?.race_ethnicity || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300">
                        {member.matrix_data?.professional?.sector || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {(member.matrix_data?.professional?.expertise || []).slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="inline-flex px-2 py-1 text-xs font-semibold bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20"
                          >
                            {skill}
                          </span>
                        ))}
                        {(member.matrix_data?.professional?.expertise || []).length > 3 && (
                          <span className="text-xs text-slate-500">
                            +{(member.matrix_data?.professional?.expertise || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300">
                        {member.matrix_data?.geography?.primary_location || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-300">
                        {member.matrix_data?.professional?.years_on_board || 'N/A'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Gender Distribution</h3>
          <div className="space-y-2">
            {(() => {
              const genderCounts = {};
              boardMembers.forEach(m => {
                const gender = m.matrix_data?.demographics?.gender || 'Unknown';
                genderCounts[gender] = (genderCounts[gender] || 0) + 1;
              });
              return Object.entries(genderCounts).map(([gender, count]) => (
                <div key={gender} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{gender}</span>
                  <span className="text-lg font-bold text-white">{count}</span>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Age Distribution</h3>
          <div className="space-y-2">
            {(() => {
              const ageCounts = {};
              boardMembers.forEach(m => {
                const age = m.matrix_data?.demographics?.age_range || 'Unknown';
                ageCounts[age] = (ageCounts[age] || 0) + 1;
              });
              return Object.entries(ageCounts).map(([age, count]) => (
                <div key={age} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{age}</span>
                  <span className="text-lg font-bold text-white">{count}</span>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Sector Distribution</h3>
          <div className="space-y-2">
            {(() => {
              const sectorCounts = {};
              boardMembers.forEach(m => {
                const sector = m.matrix_data?.professional?.sector || 'Unknown';
                sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
              });
              return Object.entries(sectorCounts).slice(0, 4).map(([sector, count]) => (
                <div key={sector} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 truncate">{sector}</span>
                  <span className="text-lg font-bold text-white">{count}</span>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Racial Diversity</h3>
          <div className="space-y-2">
            {(() => {
              const raceCounts = {};
              boardMembers.forEach(m => {
                const race = m.matrix_data?.demographics?.race_ethnicity || 'Unknown';
                raceCounts[race] = (raceCounts[race] || 0) + 1;
              });
              const nonCaucasian = Object.entries(raceCounts)
                .filter(([race]) => race !== 'Caucasian')
                .reduce((sum, [_, count]) => sum + count, 0);
              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Caucasian</span>
                    <span className="text-lg font-bold text-white">{raceCounts['Caucasian'] || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Diverse</span>
                    <span className="text-lg font-bold text-emerald-400">{nonCaucasian}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
