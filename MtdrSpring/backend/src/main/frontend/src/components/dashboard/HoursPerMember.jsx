import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { dashboardService } from '../../services/dashboardService';

function Skeleton() {
  return <div className="animate-pulse h-40 rounded-lg" style={{ background: 'var(--bg-card-alt)' }} />;
}

function initials(name) {
  return name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?';
}

export default function HoursPerMember({ sprintId, devId }) {
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
  if (!data) return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a sprint to view data.</p>;
  if (!data.members?.length) return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hours logged yet.</p>;

  const filtered = devId ? data.members.filter((m) => m.userId === devId) : data.members;
  const sorted = [...filtered].sort((a, b) => b.actualHours - a.actualHours);
  const max = sorted[0]?.actualHours || 1;

  return (
    <div className="space-y-3">
      {sorted.map((m, i) => {
        const pct = (m.actualHours / max) * 100;
        return (
          <div key={m.userId} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ background: '#E8F0F7', color: '#003865' }}
                >
                  {initials(m.fullName)}
                </div>
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{m.fullName}</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>{m.actualHours?.toFixed(1)}h</span>
            </div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--bg-card-alt)' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: '#003865',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
