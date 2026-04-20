import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() { return <div className="animate-pulse h-48 bg-gray-50 rounded-lg" />; }

export default function EfficiencyChart({ sprintId }) {
  const { project } = useProject();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    dashboardService.efficiency(project.id, sprintId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, sprintId]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-red-500">{error}</p>;
  if (!data || !data.members?.length)
    return <p className="text-sm text-gray-400">No completed tasks in the active sprint.</p>;

  const chartData = data.members.map((m) => ({
    name: m.fullName.split(' ')[0],
    'SP done': m.spCompleted,
    'Hours': parseFloat(m.actualHours.toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <Tooltip />
        <Legend iconType="square" wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="SP done" fill="#1f2937" radius={[3, 3, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Hours" fill="#9ca3af" radius={[3, 3, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
