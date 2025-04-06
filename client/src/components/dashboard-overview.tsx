
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain, Cpu, Clock, BarChart3 } from 'lucide-react';

const pipelineData = [
  { stage: 'Concept', value: 78, color: 'hsl(200, 100%, 60%)' },
  { stage: 'Parallel', value: 92, color: 'hsl(220, 100%, 50%)' },
  { stage: 'Synthesis', value: 85, color: 'hsl(240, 100%, 70%)' },
  { stage: 'Enhancement', value: 81, color: 'hsl(260, 100%, 70%)' },
  { stage: 'Visual', value: 95, color: 'hsl(180, 100%, 65%)' }
];

const modelUsageData = [
  { name: 'Claude Opus', value: 42, color: 'hsl(200, 100%, 60%)' },
  { name: 'GPT-4', value: 28, color: 'hsl(220, 100%, 50%)' },
  { name: 'Gemini Pro', value: 18, color: 'hsl(240, 100%, 70%)' },
  { name: 'DeepSeek', value: 12, color: 'hsl(260, 100%, 70%)' }
];

const recentProjects = [
  { 
    id: 1, 
    name: 'Cosmic Exploration Narrative', 
    stages: 5, 
    status: 'completed', 
    confidence: 0.94,
    timestamp: '2 hours ago'
  },
  { 
    id: 2, 
    name: 'Neural Architecture Visualization', 
    stages: 5, 
    status: 'completed', 
    confidence: 0.91,
    timestamp: '4 hours ago'
  },
  { 
    id: 3, 
    name: 'Quantum Physics Explainer', 
    stages: 5, 
    status: 'completed', 
    confidence: 0.89,
    timestamp: '6 hours ago'
  },
  { 
    id: 4, 
    name: 'Climate Data Narrative', 
    stages: 3, 
    status: 'in_progress', 
    confidence: 0.87,
    timestamp: 'Just now'
  }
];

export const DashboardOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Pipeline Runs"
        value="248"
        change="+12%"
        icon={<Brain className="w-5 h-5" />}
        color="hsl(200, 100%, 60%)"
      />
      <StatCard 
        title="Model Calls"
        value="1,284"
        change="+8%"
        icon={<Cpu className="w-5 h-5" />}
        color="hsl(220, 100%, 50%)"
      />
      <StatCard 
        title="Avg. Process Time"
        value="48s"
        change="-4%"
        trend="down"
        icon={<Clock className="w-5 h-5" />}
        color="hsl(180, 100%, 65%)"
      />
      <StatCard 
        title="Confidence Score"
        value="92%"
        change="+2%"
        icon={<BarChart3 className="w-5 h-5" />}
        color="hsl(240, 100%, 70%)"
      />
      
      <div className="col-span-1 md:col-span-2 bg-[hsl(220,15%,12%)] rounded-lg p-6 border border-[hsl(220,20%,20%)]">
        <h3 className="text-lg font-medium mb-4 text-white">Pipeline Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pipelineData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="stage" stroke="hsl(220,20%,70%)" />
              <YAxis stroke="hsl(220,20%,70%)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(220,15%,14%)', 
                  border: '1px solid hsl(220,20%,20%)',
                  color: 'white'
                }} 
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-2 bg-[hsl(220,15%,12%)] rounded-lg p-6 border border-[hsl(220,20%,20%)]">
        <h3 className="text-lg font-medium mb-4 text-white">Model Usage</h3>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={modelUsageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {modelUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(220,15%,14%)', 
                  border: '1px solid hsl(220,20%,20%)',
                  color: 'white'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-4 bg-[hsl(220,15%,12%)] rounded-lg p-6 border border-[hsl(220,20%,20%)]">
        <h3 className="text-lg font-medium mb-4 text-white">Recent Projects</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(220,20%,20%)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(220,20%,70%)]">Project</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(220,20%,70%)]">Stages</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(220,20%,70%)]">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(220,20%,70%)]">Confidence</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(220,20%,70%)]">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map(project => (
                <tr key={project.id} className="border-b border-[hsl(220,20%,20%)]">
                  <td className="py-3 px-4 text-white">{project.name}</td>
                  <td className="py-3 px-4 text-white">{project.stages}/5</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${project.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'}`
                    }>
                      {project.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{project.confidence * 100}%</td>
                  <td className="py-3 px-4 text-[hsl(220,20%,70%)]">{project.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, trend = 'up', icon, color }) => (
  <div className="bg-[hsl(220,15%,12%)] rounded-lg p-6 border border-[hsl(220,20%,20%)]">
    <div className="flex items-center justify-between mb-4">
      <span className="text-[hsl(220,20%,70%)]">{title}</span>
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
        {icon}
      </div>
    </div>
    <div className="flex items-baseline">
      <h3 className="text-2xl font-bold text-white mr-2">{value}</h3>
      <span className={trend === 'up' ? 'text-green-400' : 'text-red-400'}>
        {change}
      </span>
    </div>
  </div>
);

export default DashboardOverview;
