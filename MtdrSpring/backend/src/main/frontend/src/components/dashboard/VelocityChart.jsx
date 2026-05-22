import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';
import { exportCsv } from '../../services/importExportService';
import ExportCsvButton from '../common/ExportCsvButton';

function Skeleton() {
  return <div className="animate-pulse h-48 rounded-lg" style={{ background: 'var(--bg-card-alt)' }} />;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-[13px] font-bold text-navy">{payload[0].value} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>SP completed</span></p>
    </div>
  );
};

export default function VelocityChart() {
  const { project } = useProject();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.velocity(project.id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-oracle">{error}</p>;
  if (!data.length) return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No closed sprints yet.</p>;

  const maxVal = Math.max(...data.map((d) => d.spCompleted));

  const handleExport = () => {
    const rows = data.map((d) => ({ Sprint: d.sprintName, 'SP Completados': d.spCompleted }));
    exportCsv(rows, `velocity-proyecto-${project.id}`);
  };

  return (
    <div>
      <div className="flex justify-end mb-1">
        <ExportCsvButton onClick={handleExport} />
      </div>
      <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.25)" vertical={false} />
        <XAxis
          dataKey="sprintName"
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
        <Bar dataKey="spCompleted" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((entry) => (
            <Cell
              key={entry.sprintName}
              fill={entry.spCompleted === maxVal ? '#003865' : '#93B4D0'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}
