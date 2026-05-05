import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

const MEMBER_COLORS = [
  '#003865', '#C74634', '#1D4ED8', '#15803D',
  '#7C3AED', '#D97706', '#0891B2', '#DB2777',
];

function Skeleton() {
  return <div className="animate-pulse h-56 bg-gray-50 rounded-lg" />;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-3 py-2.5 shadow-lg border border-gray-100 space-y-1">
      <p className="text-[11px] font-bold text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-[12px] font-semibold" style={{ color: p.fill }}>
          {p.value}h <span className="font-normal text-gray-400">· {p.name}</span>
        </p>
      ))}
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap items-center gap-3 justify-center pt-2">
    {payload.map((p) => (
      <div key={p.value} className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: p.color }} />
        <span className="text-[11px] font-semibold text-gray-500">{p.value}</span>
      </div>
    ))}
  </div>
);

export default function HoursByDeveloperChart({ sprints }) {
  const { project } = useProject();
  const [chartData, setChartData] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sprints?.length) { setLoading(false); return; }

    const active = sprints.find((s) => s.status === 'ACTIVE');
    const closed = sprints
      .filter((s) => s.status === 'CLOSED')
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
      .slice(-3);
    const selected = [...closed, ...(active ? [active] : [])];

    if (!selected.length) { setLoading(false); return; }

    setLoading(true);
    Promise.all(selected.map((s) => dashboardService.efficiency(project.id, s.id)))
      .then((results) => {
        // Aggregate total hours per member across all sprints
        const totals = {};
        const nameMap = {};
        results.forEach((res) => {
          (res?.members || []).forEach((m) => {
            totals[m.userId] = (totals[m.userId] || 0) + (m.actualHours || 0);
            nameMap[m.userId] = m.fullName;
          });
        });

        // Top 8 by total hours
        const top8ids = Object.entries(totals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([id]) => Number(id));

        // Build recharts data
        const data = selected.map((s, i) => {
          const row = { sprint: s.sprintName };
          const members = results[i]?.members || [];
          top8ids.forEach((uid) => {
            const m = members.find((x) => x.userId === uid);
            row[nameMap[uid]] = m ? parseFloat(m.actualHours.toFixed(1)) : 0;
          });
          return row;
        });

        setMembers(top8ids.map((uid) => nameMap[uid]));
        setChartData(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, sprints]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-oracle">{error}</p>;
  if (!chartData.length) return <p className="text-sm text-gray-400">No sprint data available.</p>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="sprint"
          tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Manrope' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'Manrope' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB', radius: 4 }} />
        <Legend content={<CustomLegend />} />
        {members.map((name, i) => (
          <Bar
            key={name}
            dataKey={name}
            fill={MEMBER_COLORS[i % MEMBER_COLORS.length]}
            radius={[3, 3, 0, 0]}
            maxBarSize={32}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
