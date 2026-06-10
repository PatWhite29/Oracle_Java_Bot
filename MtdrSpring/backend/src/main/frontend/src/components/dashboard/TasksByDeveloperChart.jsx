import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';
import { exportCsv } from '../../services/importExportService';
import ExportCsvButton from '../common/ExportCsvButton';

const MEMBER_COLORS = [
  '#003865', '#C74634', '#1D4ED8', '#15803D',
  '#7C3AED', '#D97706', '#0891B2', '#DB2777',
];

function Skeleton() {
  return <div className="animate-pulse h-56 rounded-lg" style={{ background: 'var(--bg-card-alt)' }} />;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-lg space-y-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <p className="text-[11px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-[12px] font-semibold" style={{ color: p.fill }}>
          {p.value} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>tasks · {p.name}</span>
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
        <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{p.value}</span>
      </div>
    ))}
  </div>
);

export default function TasksByDeveloperChart({ sprints, selectedSprintId }) {
  const { project } = useProject();
  const [chartData, setChartData] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sprints?.length) { setLoading(false); return; }

    let selected;
    if (selectedSprintId) {
      const single = sprints.find((s) => s.id === selectedSprintId);
      selected = single ? [single] : [];
    } else {
      const active = sprints.find((s) => s.status === 'ACTIVE');
      const closed = sprints
        .filter((s) => s.status === 'CLOSED')
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
        .slice(-3);
      selected = [...closed, ...(active ? [active] : [])];
    }

    if (!selected.length) { setLoading(false); return; }

    setLoading(true);
    Promise.all(selected.map((s) => dashboardService.workload(project.id, s.id)))
      .then((results) => {
        const totals = {};
        const nameMap = {};
        results.forEach((sprintData) => {
          sprintData.forEach((m) => {
            totals[m.userId] = (totals[m.userId] || 0) + (m.taskCounts?.DONE || 0);
            nameMap[m.userId] = m.fullName;
          });
        });

        const top8ids = Object.entries(totals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([id]) => Number(id));

        const data = selected.map((s, i) => {
          const row = { sprint: s.sprintName };
          const sprintData = results[i];
          top8ids.forEach((uid) => {
            const m = sprintData.find((x) => x.userId === uid);
            row[nameMap[uid]] = m?.taskCounts?.DONE || 0;
          });
          return row;
        });

        setMembers(top8ids.map((uid) => nameMap[uid]));
        setChartData(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [project.id, sprints, selectedSprintId]);

  if (loading) return <Skeleton />;
  if (error) return <p className="text-xs text-oracle">{error}</p>;
  if (!chartData.length) return <p className="text-sm text-gray-400">No closed sprints yet.</p>;

  const handleExport = () => {
    const rows = chartData.map(({ sprint, ...devs }) => ({ Sprint: sprint, ...devs }));
    exportCsv(rows, `tareas-por-desarrollador-proyecto-${project.id}`);
  };

  return (
    <div>
      <div className="flex justify-end mb-1">
        <ExportCsvButton onClick={handleExport} />
      </div>
      <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.25)" vertical={false} />
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
          allowDecimals={false}
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
    </div>
  );
}
