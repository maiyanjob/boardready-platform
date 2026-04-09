import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

// Column groups matching the Excel Board Recruitment Matrix template
const COLUMN_GROUPS = [
  {
    label: 'Demographics',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    columns: ['Gender', 'Age Range', 'Race / Ethnicity', 'Disability']
  },
  {
    label: 'Sector',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    columns: ['Sector']
  },
  {
    label: 'Expertise / Skills',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bg: 'bg-cyan-500/5',
    columns: ['Skills']
  },
  {
    label: 'Community Connections',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    columns: ['Connections']
  },
  {
    label: 'Personal Style',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    bg: 'bg-rose-500/5',
    columns: ['Style']
  },
  {
    label: 'Geography',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    columns: ['Location', 'Regions']
  },
  {
    label: 'Board Tenure',
    color: 'text-slate-400',
    borderColor: 'border-slate-500/30',
    bg: 'bg-slate-500/5',
    columns: ['Years']
  }
];

const GENDER_COLORS = {
  'Female': 'bg-purple-500/10 text-purple-300 border-purple-500/25',
  'Male': 'bg-blue-500/10 text-blue-300 border-blue-500/25',
  'Non-Conforming': 'bg-rose-500/10 text-rose-300 border-rose-500/25',
};

const RACE_COLORS = {
  'Caucasian': 'bg-slate-700/50 text-slate-300 border-slate-600/30',
  'African American/Black': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  'Asian/Pacific Islander': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
  'Latino/Hispanic': 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  'Native American/Indian': 'bg-orange-500/10 text-orange-300 border-orange-500/25',
};

// Map the Excel's 15 expertise categories to badge colors
const SKILL_COLORS = {
  'Technology': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  'Finance': 'bg-green-500/10 text-green-300 border-green-500/20',
  'Finance/Investments/Real Estate': 'bg-green-500/10 text-green-300 border-green-500/20',
  'Government/Law': 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  'Health': 'bg-red-500/10 text-red-300 border-red-500/20',
  'Education': 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  'Marketing/PR/Communications': 'bg-pink-500/10 text-pink-300 border-pink-500/20',
  'Arts & Culture': 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  'Strategic Planning': 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'Strategic Planning/Research': 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'Operations': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'Operations/Management': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'HR/Diversity': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'Environment': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'Development': 'bg-teal-500/10 text-teal-300 border-teal-500/20',
};

const DEFAULT_SKILL_COLOR = 'bg-slate-700/50 text-slate-300 border-slate-600/30';

const CONNECTION_COLORS = {
  'Corporate': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'Education': 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  'Media': 'bg-pink-500/10 text-pink-300 border-pink-500/20',
  'Political': 'bg-red-500/10 text-red-300 border-red-500/20',
  'Philanthropy': 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  'Social Services': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'Faith Based Organizations': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'Small Business': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
};

const STYLE_COLORS = {
  'Consensus builder': 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  'Good communicator': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'Strategist': 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'Team member': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'Visionary': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

function TagBadge({ label, colorClass }) {
  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded border ${colorClass || DEFAULT_SKILL_COLOR} whitespace-nowrap`}>
      {label}
    </span>
  );
}

function TagList({ items = [], colorMap = {}, defaultColor, max = 4 }) {
  if (!items || items.length === 0) {
    return <span className="text-xs text-slate-600 italic">—</span>;
  }
  const visible = items.slice(0, max);
  const extra = items.length - max;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((item, i) => (
        <TagBadge key={i} label={item} colorClass={colorMap[item] || defaultColor} />
      ))}
      {extra > 0 && (
        <span className="text-[10px] text-slate-500 self-center">+{extra}</span>
      )}
    </div>
  );
}

export default function BoardMatrix({ boardMembers }) {

  const exportToCSV = () => {
    const headers = [
      'Name', 'Organization', 'Position',
      'Gender', 'Age Range', 'Race/Ethnicity', 'Disability',
      'Sector', 'Expertise/Skills',
      'Community Connections', 'Personal Style',
      'Primary Location', 'Regions', 'Years on Board'
    ];

    const rows = boardMembers.map(member => [
      member.name,
      member.organization,
      member.position,
      member.matrix_data?.demographics?.gender || '',
      member.matrix_data?.demographics?.age_range || '',
      member.matrix_data?.demographics?.race_ethnicity || '',
      member.matrix_data?.demographics?.disability ? 'Yes' : '',
      member.matrix_data?.professional?.sector || '',
      (member.matrix_data?.professional?.expertise || []).join('; '),
      (member.matrix_data?.community_connections || []).join('; '),
      (member.matrix_data?.personal_style || []).join('; '),
      member.matrix_data?.geography?.primary_location || '',
      (member.matrix_data?.geography?.regions || []).join('; '),
      member.matrix_data?.professional?.years_on_board || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `board-recruitment-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Summary stats helpers
  const countBy = (fn) => {
    const counts = {};
    boardMembers.forEach(m => {
      const key = fn(m) || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const genderCounts = countBy(m => m.matrix_data?.demographics?.gender);
  const ageCounts = countBy(m => m.matrix_data?.demographics?.age_range);
  const sectorCounts = countBy(m => m.matrix_data?.professional?.sector);
  const raceCounts = countBy(m => m.matrix_data?.demographics?.race_ethnicity);

  const allSkills = {};
  boardMembers.forEach(m => {
    (m.matrix_data?.professional?.expertise || []).forEach(skill => {
      allSkills[skill] = (allSkills[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(allSkills).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const nonCaucasian = boardMembers.filter(m =>
    m.matrix_data?.demographics?.race_ethnicity &&
    m.matrix_data.demographics.race_ethnicity !== 'Caucasian'
  ).length;
  const diversityPct = boardMembers.length > 0
    ? Math.round((nonCaucasian / boardMembers.length) * 100)
    : 0;
  const femalePct = boardMembers.length > 0
    ? Math.round((boardMembers.filter(m => m.matrix_data?.demographics?.gender === 'Female').length / boardMembers.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Board Profile</p>
          <h2 className="text-2xl font-bold text-white">Recruitment Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Based on the Board Recruitment Matrix template · {boardMembers.length} members
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg
            transition-colors flex items-center gap-2 border border-emerald-500/30"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/8">
        <table className="min-w-full text-sm">
          {/* Group Headers */}
          <thead>
            <tr className="border-b border-white/8" style={{ background: '#0d1120' }}>
              <th colSpan={3} className="sticky left-0 z-20 px-4 py-3 text-left border-r border-white/8" style={{ background: '#0d1120' }}>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Board Member</span>
              </th>
              {COLUMN_GROUPS.map(group => (
                <th
                  key={group.label}
                  colSpan={group.columns.length}
                  className={`px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest border-l ${group.borderColor} ${group.color} ${group.bg}`}
                >
                  {group.label}
                </th>
              ))}
            </tr>
            <tr className="border-b border-white/8" style={{ background: '#0b0e18' }}>
              {/* Fixed member columns */}
              <th className="sticky left-0 z-20 px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-r border-white/8 min-w-[160px]" style={{ background: '#0b0e18' }}>
                Name
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[140px]">
                Organization
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[120px] border-r border-white/8">
                Position
              </th>
              {/* Demographics */}
              <th className="px-4 py-3 text-[10px] font-bold text-purple-400/70 uppercase tracking-wider whitespace-nowrap border-l border-purple-500/20">Gender</th>
              <th className="px-4 py-3 text-[10px] font-bold text-purple-400/70 uppercase tracking-wider whitespace-nowrap">Age</th>
              <th className="px-4 py-3 text-[10px] font-bold text-purple-400/70 uppercase tracking-wider whitespace-nowrap min-w-[160px]">Race / Ethnicity</th>
              <th className="px-4 py-3 text-[10px] font-bold text-purple-400/70 uppercase tracking-wider whitespace-nowrap">Disability</th>
              {/* Sector */}
              <th className="px-4 py-3 text-[10px] font-bold text-blue-400/70 uppercase tracking-wider whitespace-nowrap min-w-[140px] border-l border-blue-500/20">Sector</th>
              {/* Expertise */}
              <th className="px-4 py-3 text-[10px] font-bold text-cyan-400/70 uppercase tracking-wider min-w-[220px] border-l border-cyan-500/20">Expertise / Skills</th>
              {/* Community */}
              <th className="px-4 py-3 text-[10px] font-bold text-amber-400/70 uppercase tracking-wider min-w-[180px] border-l border-amber-500/20">Connections</th>
              {/* Personal Style */}
              <th className="px-4 py-3 text-[10px] font-bold text-rose-400/70 uppercase tracking-wider min-w-[160px] border-l border-rose-500/20">Personal Style</th>
              {/* Geography */}
              <th className="px-4 py-3 text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider whitespace-nowrap border-l border-emerald-500/20">Location</th>
              <th className="px-4 py-3 text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider whitespace-nowrap">Regions</th>
              {/* Tenure */}
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-l border-slate-600/20">Yrs</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5" style={{ background: '#0a0c15' }}>
            {boardMembers.map((member, index) => {
              const d = member.matrix_data?.demographics || {};
              const p = member.matrix_data?.professional || {};
              const g = member.matrix_data?.geography || {};
              const cc = member.matrix_data?.community_connections;
              const ps = member.matrix_data?.personal_style;

              return (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="hover:bg-white/3 transition-colors group"
                >
                  {/* Name */}
                  <td className="sticky left-0 z-10 px-4 py-3 border-r border-white/8 group-hover:bg-indigo-500/5 transition-colors" style={{ background: '#0a0c15' }}>
                    <div className="text-sm font-bold text-white">{member.name}</div>
                  </td>
                  {/* Organization */}
                  <td className="px-4 py-3">
                    <div className="text-xs text-slate-300 whitespace-nowrap">{member.organization || '—'}</div>
                  </td>
                  {/* Position */}
                  <td className="px-4 py-3 border-r border-white/8">
                    <div className="text-xs text-slate-400">{member.position || '—'}</div>
                  </td>

                  {/* Gender */}
                  <td className="px-4 py-3 border-l border-purple-500/10">
                    {d.gender ? (
                      <TagBadge label={d.gender} colorClass={GENDER_COLORS[d.gender] || DEFAULT_SKILL_COLOR} />
                    ) : <span className="text-xs text-slate-600">—</span>}
                  </td>
                  {/* Age */}
                  <td className="px-4 py-3">
                    {d.age_range ? (
                      <TagBadge label={d.age_range} colorClass="bg-purple-500/8 text-purple-300/80 border-purple-500/20" />
                    ) : <span className="text-xs text-slate-600">—</span>}
                  </td>
                  {/* Race/Ethnicity */}
                  <td className="px-4 py-3">
                    {d.race_ethnicity ? (
                      <TagBadge label={d.race_ethnicity} colorClass={RACE_COLORS[d.race_ethnicity] || DEFAULT_SKILL_COLOR} />
                    ) : <span className="text-xs text-slate-600">—</span>}
                  </td>
                  {/* Disability */}
                  <td className="px-4 py-3 text-center">
                    {d.disability ? (
                      <span className="inline-block w-4 h-4 rounded-full bg-amber-500/30 border border-amber-500/50" title="Disability" />
                    ) : (
                      <span className="text-xs text-slate-700">—</span>
                    )}
                  </td>

                  {/* Sector */}
                  <td className="px-4 py-3 border-l border-blue-500/10">
                    {p.sector ? (
                      <TagBadge label={p.sector} colorClass="bg-blue-500/10 text-blue-300 border-blue-500/20" />
                    ) : <span className="text-xs text-slate-600">—</span>}
                  </td>

                  {/* Expertise */}
                  <td className="px-4 py-3 border-l border-cyan-500/10">
                    <TagList items={p.expertise} colorMap={SKILL_COLORS} defaultColor={DEFAULT_SKILL_COLOR} max={4} />
                  </td>

                  {/* Community Connections */}
                  <td className="px-4 py-3 border-l border-amber-500/10">
                    {cc && cc.length > 0 ? (
                      <TagList items={cc} colorMap={CONNECTION_COLORS} defaultColor="bg-amber-500/8 text-amber-300/70 border-amber-500/20" max={3} />
                    ) : (
                      <span className="text-xs text-slate-600 italic">Not recorded</span>
                    )}
                  </td>

                  {/* Personal Style */}
                  <td className="px-4 py-3 border-l border-rose-500/10">
                    {ps && ps.length > 0 ? (
                      <TagList items={ps} colorMap={STYLE_COLORS} defaultColor="bg-rose-500/8 text-rose-300/70 border-rose-500/20" max={3} />
                    ) : (
                      <span className="text-xs text-slate-600 italic">Not recorded</span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 border-l border-emerald-500/10">
                    <div className="text-xs text-slate-300 whitespace-nowrap">{g.primary_location || '—'}</div>
                  </td>
                  {/* Regions */}
                  <td className="px-4 py-3">
                    <TagList items={g.regions} colorMap={{}} defaultColor="bg-emerald-500/8 text-emerald-300/70 border-emerald-500/20" max={2} />
                  </td>

                  {/* Years */}
                  <td className="px-4 py-3 text-center border-l border-slate-600/15">
                    {p.years_on_board !== undefined && p.years_on_board !== null ? (
                      <span className="text-sm font-bold text-white">{p.years_on_board}</span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats — matching Excel categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        {/* Gender */}
        <div className="bg-slate-900/90 border border-white/8 rounded-2xl p-4 col-span-1">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3">Gender</p>
          <div className="space-y-1.5">
            {genderCounts.map(([g, count]) => (
              <div key={g} className="flex items-center justify-between">
                <span className="text-xs text-slate-400 truncate">{g}</span>
                <span className="text-sm font-black text-white ml-2">{count}</span>
              </div>
            ))}
            <div className="pt-1.5 border-t border-white/8 mt-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">% Female</span>
                <span className="text-xs font-bold text-purple-400">{femalePct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Age Distribution */}
        <div className="bg-slate-900/90 border border-white/8 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3">Age Ranges</p>
          <div className="space-y-1.5">
            {['19-34', '35-50', '51-65', 'Over 65'].map(range => {
              const count = boardMembers.filter(m => m.matrix_data?.demographics?.age_range === range).length;
              return (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{range}</span>
                  <span className={`text-sm font-black ${count > 0 ? 'text-white' : 'text-slate-700'}`}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector */}
        <div className="bg-slate-900/90 border border-white/8 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Sector</p>
          <div className="space-y-1.5">
            {sectorCounts.slice(0, 5).map(([sector, count]) => (
              <div key={sector} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400 truncate">{sector}</span>
                <span className="text-sm font-black text-white flex-shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills */}
        <div className="bg-slate-900/90 border border-white/8 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3">Top Skills</p>
          <div className="space-y-1.5">
            {topSkills.map(([skill, count]) => (
              <div key={skill} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400 truncate">{skill}</span>
                <span className="text-sm font-black text-white flex-shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Race/Ethnicity */}
        <div className="bg-slate-900/90 border border-white/8 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">Ethnicity</p>
          <div className="space-y-1.5">
            {raceCounts.map(([race, count]) => (
              <div key={race} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400 truncate">{race}</span>
                <span className="text-sm font-black text-white flex-shrink-0">{count}</span>
              </div>
            ))}
            <div className="pt-1.5 border-t border-white/8 mt-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">% Diverse</span>
                <span className="text-xs font-bold text-emerald-400">{diversityPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Geography */}
        <div className="bg-slate-900/90 border border-white/8 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">Geography</p>
          <div className="space-y-1.5">
            {(() => {
              const regionCounts = {};
              boardMembers.forEach(m => {
                (m.matrix_data?.geography?.regions || []).forEach(r => {
                  regionCounts[r] = (regionCounts[r] || 0) + 1;
                });
              });
              const sorted = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
              return sorted.length > 0 ? sorted.map(([region, count]) => (
                <div key={region} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400 truncate">{region}</span>
                  <span className="text-sm font-black text-white flex-shrink-0">{count}</span>
                </div>
              )) : <span className="text-xs text-slate-600 italic">No region data</span>;
            })()}
          </div>
        </div>
      </div>

      {/* Community Connections + Personal Style note */}
      <div className="flex gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
        <div className="text-amber-400 text-lg">ℹ</div>
        <div>
          <p className="text-xs font-semibold text-amber-300 mb-0.5">Community Connections & Personal Style</p>
          <p className="text-xs text-slate-400">
            These columns are part of the Board Recruitment Matrix template but have not yet been recorded for current board members.
            Update member profiles via the AI Assistant or import to populate these fields.
          </p>
        </div>
      </div>
    </div>
  );
}
