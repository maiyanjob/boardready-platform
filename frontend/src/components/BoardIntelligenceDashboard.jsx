import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Grid, Metric, Flex, ProgressBar, Badge } from '@tremor/react';
import { DonutChart } from '@tremor/react';
import BoardExpertiseHeatmap from './BoardExpertiseHeatmap';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const BoardIntelligenceDashboard = ({ projectId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [projectId]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/dashboard-data`, {
        credentials: 'include'
      });
      const data = await response.json();
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading intelligent gap analysis...</div>;
  }

  if (!dashboardData || !dashboardData.success) {
    return <div className="p-6">No data available</div>;
  }

  const { gaps, metrics } = dashboardData;

  // Shorter category names for radar chart
  const radarData = gaps.map(gap => {
    let shortName = gap.gap_title;
    if (shortName.includes('&')) {
      // Split on & and take first part
      shortName = shortName.split('&')[0].trim();
    }
    if (shortName.length > 20) {
      shortName = shortName.substring(0, 20) + '...';
    }
    return {
      category: shortName,
      current: gap.current_coverage,
      target: gap.target_coverage,
      fullName: gap.gap_title
    };
  });

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'emerald';
      default: return 'gray';
    }
  };

  // Count gaps by priority for donut
  const criticalCount = gaps.filter(g => g.priority === 'critical').length;
  const highCount = gaps.filter(g => g.priority === 'high').length;
  const mediumCount = gaps.filter(g => g.priority === 'medium').length;
  const lowCount = gaps.filter(g => g.priority === 'low').length;

  return (
    <div className="space-y-6 p-6">
      {/* BRI KPI Cards */}
      <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Text>BRI: Gender Component</Text>
          <Metric>{metrics.female_percentage}%</Metric>
          <Text className="text-sm text-gray-500">S&P 500 benchmark: 32%</Text>
        </Card>

        <Card decoration="top" decorationColor="violet">
          <Text>BRI: Race/Ethnicity Component</Text>
          <Metric>{metrics.diverse_percentage}%</Metric>
          <Text className="text-sm text-gray-500">S&P 500 benchmark: 28%</Text>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <Text>Critical Gaps</Text>
          <Metric>{metrics.critical_gaps}</Metric>
          <Text className="text-sm text-gray-500">High Priority: {metrics.high_gaps}</Text>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <Text>Board Size</Text>
          <Metric>{metrics.total_members}</Metric>
          <Text className="text-sm text-gray-500">{metrics.total_gaps} categories analyzed</Text>
        </Card>
      </Grid>

      {/* Board Composition Gap Analysis */}
      <Card>
        <Title>Board Composition Gap Analysis (BoardReady Method)</Title>
        <Text className="mb-4">AI-powered gap analysis using BoardReady's methodology — identifying expertise blind spots and diversity opportunities</Text>
        
        <div className="space-y-4">
          {gaps.map((gap, idx) => (
            <div key={idx} className="border-l-4 pl-4 py-2" style={{ 
              borderColor: gap.priority === 'critical' ? '#ef4444' : 
                          gap.priority === 'high' ? '#f97316' : 
                          gap.priority === 'medium' ? '#eab308' : '#22c55e'
            }}>
              <Flex justifyContent="between" alignItems="start">
                <div className="flex-1">
                  <Flex alignItems="center" className="gap-2 mb-2">
                    <Text className="font-semibold">{gap.gap_title}</Text>
                    <Badge color={getPriorityBadge(gap.priority)}>
                      {gap.priority.toUpperCase()}
                    </Badge>
                  </Flex>
                  
                  <Flex className="gap-4 mb-2">
                    <Text className="text-sm">
                      Current: <span className="font-semibold">{gap.current_coverage}%</span>
                    </Text>
                    <Text className="text-sm">
                      Target: <span className="font-semibold">{gap.target_coverage}%</span>
                    </Text>
                    <Text className="text-sm">
                      Gap: <span className="font-semibold text-red-600">{gap.gap_score}</span>
                    </Text>
                  </Flex>
                  
                  <ProgressBar 
                    value={gap.current_coverage} 
                    color={gap.gap_score > 20 ? 'red' : gap.gap_score > 10 ? 'yellow' : 'green'}
                    className="mt-2"
                  />
                  
                  {gap.members_with && gap.members_with.length > 0 && (
                    <Text className="text-xs text-gray-600 mt-2">
                      ✓ Has expertise: {gap.members_with.join(', ')}
                    </Text>
                  )}
                </div>
              </Flex>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts */}
      <Grid numItemsLg={2} className="gap-6">
        {/* LARGER Radar Chart with Better Labels */}
        <Card>
          <Title>BRI Diversity Components — Coverage vs Target</Title>
          <Text className="mb-4">Hover to see full category names</Text>
          <ResponsiveContainer width="100%" height={550}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#9ca3af' }}
              />
              <Radar 
                name="Current Coverage" 
                dataKey="current" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.5} 
                strokeWidth={2}
              />
              <Radar 
                name="Target Needed" 
                dataKey="target" 
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.3} 
                strokeWidth={2}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value, name, props) => {
                  return [`${value}%`, name];
                }}
                labelFormatter={(label) => {
                  const item = radarData.find(d => d.category === label);
                  return item ? item.fullName : label;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Fixed Donut Chart - Explicit Color Mapping */}
        <Card>
          <Title>BoardReady Index — Gap Priority Distribution</Title>
          <Text className="mb-4">Total: {gaps.length} categories analyzed</Text>
          
          <div className="h-80 flex flex-col justify-center">
            {/* Manual color assignment to avoid Tremor issues */}
            <div className="space-y-4">
              {criticalCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-500/10 border-l-4 border-red-500 rounded">
                  <Text className="font-medium">Critical Priority</Text>
                  <Metric className="text-red-500">{criticalCount}</Metric>
                </div>
              )}
              {highCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-500/10 border-l-4 border-orange-500 rounded">
                  <Text className="font-medium">High Priority</Text>
                  <Metric className="text-orange-500">{highCount}</Metric>
                </div>
              )}
              {mediumCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 border-l-4 border-yellow-500 rounded">
                  <Text className="font-medium">Medium Priority</Text>
                  <Metric className="text-yellow-500">{mediumCount}</Metric>
                </div>
              )}
              {lowCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 border-l-4 border-emerald-500 rounded">
                  <Text className="font-medium">Low Priority</Text>
                  <Metric className="text-emerald-500">{lowCount}</Metric>
                </div>
              )}
            </div>
          </div>
        </Card>
      </Grid>

      {/* Board Skills Matrix Heatmap */}
      <BoardExpertiseHeatmap gaps={gaps} projectId={projectId} />
    </div>
  );
};

export default BoardIntelligenceDashboard;
