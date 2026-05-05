import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

const MEMBER_COLORS = [
  '#003865', '#C74634', '#1D4ED8', '#15803D',
  '#7C3AED', '#D97706', '#0891B2', '#DB2777',
];

const MAX_SPRINTS = 5;

const METRICS = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'hours', label: 'Hours' },
  { key: 'sp',    label: 'SP' },
];

function Skeleton() {
  return <div className="animate-pulse h-56 bg-gray-50 rounded-lg" />;
}

function Chip({ label, selected, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border"
      style={{
        background: selected ? '#003865' : '#F9FAFB',
        color: selected ? 'white' : disabled ? '#D1D5DB' : '#374151',
        borderColor: selected ? '#003865' : disabled ? '#E5E7EB' : '#E5E7EB',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );
}

const CustomTooltip = ({ active, payload, label, metric }) => {
  if (!active || !payload?.length) return null;
  const unit = metric === 'hours' ? 'h' : metric === 'sp' ? ' SP' : ' tasks';
  return (
    <div className="bg-white rounded-xl px-3 py-2.5 shadow-lg border border-gray-100 space-y-1">
      <p className="text-[11px] font-bold text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-[12px] font-semibold" style={{ color: p.fill }}>
          {p.value}{unit} <span className="font-normal text-gray-400">· {p.name}</span>
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

export default function ComparePanel({ sprints }) {
  const { project } = useProject();

  const [metric, setMetric] = useState('tasks');
  const [selectedSprintIds, setSelectedSprintIds] = useState([]);
  const [allMembers, setAllMembers] = useState([]);      // [{ userId, fullName }]
  const [selectedMemberIds, setSelectedMemberIds] = useState([]); // empty = All
  const [chartData, setChartData] = useState([]);
  const [visibleMembers, setVisibleMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Init: default to last 3 closed + active
  useEffect(() => {
    if (!sprints?.length) return;
    const active = sprints.find((s) => s.status === 'ACTIVE');
    const closed = sprints
      .filter((s) => s.status === 'CLOSED')
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
      .slice(-3);
    const defaultIds = [...closed, ...(active ? [active] : [])].map((s) => s.id);
    setSelectedSprintIds(defaultIds);
  }, [sprints]);

  const toggleSprint = (id) => {
    setSelectedSprintIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleMember = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => setSelectedMemberIds([]);

  // Fetch when selectedSprints or metric change
  const fetchData = useCallback(async () => {
    if (!selectedSprintIds.length) { setChartData([]); return; }
    setLoading(true);
    setError('');
    try {
      const needsEfficiency = metric === 'hours' || metric === 'sp';
      const results = await Promise.all(
        selectedSprintIds.map((sid) =>
          needsEfficiency
            ? dashboardService.efficiency(project.id, sid)
            : dashboardService.workload(project.id, sid)
        )
      );

      // Collect all unique members
      const memberMap = {};
      results.forEach((res) => {
        const list = needsEfficiency ? (res?.members || []) : (res || []);
        list.forEach((m) => { memberMap[m.userId] = m.fullName; });
      });
      const members = Object.entries(memberMap).map(([id, name]) => ({
        userId: Number(id), fullName: name,
      }));
      setAllMembers(members);

      // Determine which members to show
      const activeMembers = selectedMemberIds.length
        ? members.filter((m) => selectedMemberIds.includes(m.userId))
        : members;
      setVisibleMembers(activeMembers);

      // Build recharts data
      const sprintList = selectedSprintIds
        .map((sid) => sprints.find((s) => s.id === sid))
        .filter(Boolean);

      const data = sprintList.map((sprint, i) => {
        const row = { sprint: sprint.sprintName };
        const res = results[i];
        activeMembers.forEach((m) => {
          if (needsEfficiency) {
            const found = (res?.members || []).find((x) => x.userId === m.userId);
            row[m.fullName] = metric === 'hours'
              ? parseFloat((found?.actualHours || 0).toFixed(1))
              : (found?.spCompleted || 0);
          } else {
            const found = (res || []).find((x) => x.userId === m.userId);
            row[m.fullName] = found?.taskCounts?.DONE || 0;
          }
        });
        return row;
      });

      setChartData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [project.id, selectedSprintIds, metric, selectedMemberIds, sprints]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const atLimit = selectedSprintIds.length >= MAX_SPRINTS;
  const isAllMembers = selectedMemberIds.length === 0;

  const sortedSprints = [...(sprints || [])].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3">
        {/* Metric */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider w-16 shrink-0">Metric</span>
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className="text-[12px] px-3 py-1 rounded-md font-semibold transition-all"
                style={{
                  background: metric === m.key ? 'white' : 'transparent',
                  color: metric === m.key ? '#111827' : '#6B7280',
                  boxShadow: metric === m.key ? '0 1px 3px rgba(0,0,0,0.09)' : 'none',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sprints */}
        <div className="flex items-start gap-3">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider w-16 shrink-0 mt-1">Sprints</span>
          <div className="flex flex-wrap gap-1.5">
            {sortedSprints.map((s) => {
              const selected = selectedSprintIds.includes(s.id);
              const disabled = !selected && atLimit;
              return (
                <Chip
                  key={s.id}
                  label={s.sprintName}
                  selected={selected}
                  disabled={disabled}
                  title={disabled ? `Max ${MAX_SPRINTS} sprints` : undefined}
                  onClick={() => !disabled && toggleSprint(s.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Members */}
        {allMembers.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider w-16 shrink-0 mt-1">Members</span>
            <div className="flex flex-wrap gap-1.5">
              <Chip label="All" selected={isAllMembers} onClick={toggleAll} />
              {allMembers.map((m) => (
                <Chip
                  key={m.userId}
                  label={m.fullName.split(' ')[0]}
                  selected={!isAllMembers && selectedMemberIds.includes(m.userId)}
                  onClick={() => toggleMember(m.userId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Chart */}
      {!selectedSprintIds.length ? (
        <p className="text-sm text-gray-400 py-6 text-center">Select at least one sprint.</p>
      ) : loading ? (
        <Skeleton />
      ) : error ? (
        <p className="text-xs text-oracle">{error}</p>
      ) : !chartData.length || !visibleMembers.length ? (
        <p className="text-sm text-gray-400 py-6 text-center">No data for the selected sprints.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
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
            <Tooltip content={<CustomTooltip metric={metric} />} cursor={{ fill: '#F9FAFB', radius: 4 }} />
            <Legend content={<CustomLegend />} />
            {visibleMembers.map((m, i) => (
              <Bar
                key={m.userId}
                dataKey={m.fullName}
                fill={MEMBER_COLORS[i % MEMBER_COLORS.length]}
                radius={[3, 3, 0, 0]}
                maxBarSize={32}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
