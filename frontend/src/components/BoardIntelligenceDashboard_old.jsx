import { Card, Title, BarList, Metric, Text, Flex, ProgressBar, Badge, DonutChart } from '@tremor/react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, AlertCircle, Target, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BoardIntelligenceDashboard({ projectData }) {
  
  // Diversity metrics for KPI cards
  const diversityMetrics = [
    {
      title: "Gender Diversity",
      metric: `${projectData.female_percentage}%`,
      target: "40%",
      progress: projectData.female_percentage,
      color: projectData.female_percentage >= 40 ? 'emerald' : 'amber',
      icon: Users
    },
    {
      title: "Racial Diversity",
      metric: `${projectData.racial_diversity_percentage}%`,
      target: "30%",
      progress: projectData.racial_diversity_percentage,
      color: projectData.racial_diversity_percentage >= 30 ? 'emerald' : 'amber',
      icon: Target
    },
    {
      title: "Critical Gaps",
      metric: projectData.critical_gaps || 0,
      target: "0",
      progress: 100 - (projectData.critical_gaps * 20),
      color: projectData.critical_gaps === 0 ? 'emerald' : 'red',
      icon: AlertCircle
    },
    {
      title: "Avg Tenure",
      metric: `${projectData.avg_tenure || 7} years`,
      target: "5-10 yrs",
      progress: 70,
      color: 'blue',
      icon: Calendar
    }
  ];

  // Term expirations data for BarList
  const termExpirations = [
    { name: '2026', value: 3, color: 'red' },
    { name: '2027', value: 5, color: 'amber' },
    { name: '2028', value: 2, color: 'emerald' },
    { name: '2029', value: 2, color: 'blue' }
  ];

  // Board composition donut chart
  const compositionData = [
    { name: 'Independent', value: 10, color: 'cyan' },
    { name: 'Executive', value: 2, color: 'purple' }
  ];

  // Radar chart data
  const radarData = [
    { skill: 'AI/ML', boardNeed: 100, candidateScore: 100 },
    { skill: 'Finance', boardNeed: 40, candidateScore: 65 },
    { skill: 'ESG', boardNeed: 90, candidateScore: 85 },
    { skill: 'Digital', boardNeed: 95, candidateScore: 95 },
    { skill: 'International', boardNeed: 80, candidateScore: 70 },
    { skill: 'Marketing', boardNeed: 50, candidateScore: 60 },
    { skill: 'Operations', boardNeed: 60, candidateScore: 55 },
    { skill: 'Legal', boardNeed: 30, candidateScore: 40 }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {diversityMetrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900 border-slate-700">
                <Flex alignItems="start">
                  <div>
                    <Text className="text-slate-400">{item.title}</Text>
                    <Metric className="text-white mt-2">{item.metric}</Metric>
                  </div>
                  <Icon className={`h-8 w-8 text-${item.color}-400`} />
                </Flex>
                <Flex className="mt-4">
                  <Text className="text-slate-500">Target: {item.target}</Text>
                  <Text className={`text-${item.color}-400`}>
                    {item.progress >= 80 ? '✓ On Track' : '⚠ Below Target'}
                  </Text>
                </Flex>
                <ProgressBar value={item.progress} color={item.color} className="mt-2" />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Term Expirations */}
        <Card className="bg-slate-900 border-slate-700">
          <Title className="text-white">Board Term Expirations</Title>
          <Text className="text-slate-400 mb-4">Directors by term end year</Text>
          <BarList data={termExpirations} className="mt-4" />
        </Card>

        {/* Board Composition */}
        <Card className="bg-slate-900 border-slate-700">
          <Title className="text-white">Board Composition</Title>
          <Text className="text-slate-400 mb-4">Independent vs Executive directors</Text>
          <DonutChart
            data={compositionData}
            category="value"
            index="name"
            colors={['cyan', 'purple']}
            className="mt-4 h-40"
          />
        </Card>
      </div>

      {/* Candidate Skill Matching Radar Chart */}
      <Card className="bg-slate-900 border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Title className="text-white">Candidate Skills Match Analysis</Title>
            <Text className="text-slate-400">Top candidate vs board gaps</Text>
          </div>
          <Badge color="emerald" size="lg">94% Match</Badge>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fill: '#64748b' }}
            />
            <Radar
              name="Board Needs"
              dataKey="boardNeed"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.3}
            />
            <Radar
              name="Candidate Sarah Chen"
              dataKey="candidateScore"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.5}
            />
            <Legend 
              wrapperStyle={{ color: '#fff' }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <Text className="text-cyan-300 font-semibold">Perfect Fit Identified</Text>
              <Text className="text-slate-300 text-sm mt-1">
                Sarah Chen scores 94% match, excelling in AI/ML (100%), Digital Transformation (95%), 
                and ESG (85%). Fills 3 critical gaps simultaneously.
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Gap Priority Matrix */}
      <Card className="bg-slate-900 border-slate-700">
        <Title className="text-white">Gap Priority Matrix</Title>
        <Text className="text-slate-400 mb-4">Strategic importance vs urgency</Text>
        
        <div className="relative h-80 bg-slate-950 rounded-lg border border-slate-700 p-6">
          {/* Grid lines */}
          <div className="absolute inset-6 border-l-2 border-b-2 border-slate-700">
            <div className="absolute top-0 left-0 h-full border-l border-dashed border-slate-700" style={{ left: '50%' }} />
            <div className="absolute bottom-0 left-0 w-full border-b border-dashed border-slate-700" style={{ bottom: '50%' }} />
          </div>
          
          {/* Labels */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-slate-400 text-xs">
            Strategic Impact →
          </div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -rotate-90 text-slate-400 text-xs">
            Urgency →
          </div>
          
          {/* Data points */}
          <GapBubble label="AI/ML" x={85} y={95} size="large" color="red" />
          <GapBubble label="Sustainability" x={75} y={85} size="medium" color="amber" />
          <GapBubble label="APAC Markets" x={80} y={70} size="medium" color="amber" />
          <GapBubble label="Gender Balance" x={60} y={65} size="small" color="blue" />
          <GapBubble label="Age Diversity" x={50} y={55} size="small" color="blue" />
        </div>
      </Card>
    </div>
  );
}

function GapBubble({ label, x, y, size, color }) {
  const sizeMap = {
    small: 'h-12 w-12',
    medium: 'h-16 w-16',
    large: 'h-20 w-20'
  };
  
  const colorMap = {
    red: 'bg-red-500/30 border-red-500 text-red-300',
    amber: 'bg-amber-500/30 border-amber-500 text-amber-300',
    blue: 'bg-blue-500/30 border-blue-500 text-blue-300'
  };

  return (
    <div
      className={`absolute ${sizeMap[size]} ${colorMap[color]} rounded-full border-2 
        flex items-center justify-center text-xs font-semibold cursor-pointer
        hover:scale-110 transition-transform duration-200`}
      style={{ 
        left: `${x}%`, 
        bottom: `${y}%`,
        transform: 'translate(-50%, 50%)'
      }}
      title={label}
    >
      {label}
    </div>
  );
}
