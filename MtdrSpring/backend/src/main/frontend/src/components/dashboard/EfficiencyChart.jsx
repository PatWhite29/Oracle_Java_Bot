import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() {
  return <div className="animate-pulse h-48 bg-gray-50 rounded-lg" />;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-3 py-2.5 shadow-lg border border-gray-100">
      <p className="text-[11px] font-bold text-gray-400 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-[12px] font-semibold" style={{ color: p.fill }}>
          {p.value} <span className="font-normal text-gray-400">{p.name}</span>
        </p>
      ))}
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div className="flex items-center gap-4 justify-end pr-2 pb-1">
    {payload.map((p) => (
      <div key={p.value} className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
        <span className="text-[11px] font-semibold text-gray-500">{p.value}</span>
      </div>
    ))}
  </div>
);

export default function EfficiencyChart({ sprintId }) {
  const { project } = useProject();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sprintId) { setLoading(false); setData(null); return; }
    setLoading(true);
    dashboardService.efficiency(project.id, sprintId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, sprintId]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-oracle">{error}</p>;
  if (!data) return <p className="text-sm text-gray-400">Select a sprint to view data.</p>;
  if (!data.members?.length) return <p className="text-sm text-gray-400">No completed tasks in this sprint.</p>;

  const chartData = data.members.map((m) => ({
    name: m.fullName.split(' ')[0],
    'SP done': m.spCompleted,
    'Hours': parseFloat(m.actualHours.toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Manrope' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Manrope' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6', radius: 4 }} />
        <Legend content={<CustomLegend />} />
        <Bar dataKey="SP done" fill="#003865" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Hours" fill="#C74634" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
