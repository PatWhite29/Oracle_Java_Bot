import React from 'react';
import Badge from '../common/Badge';

export default function TaskTable({ tasks, onTaskClick }) {
  if (tasks.length === 0) {
    return <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No tasks found.</p>;
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 4px var(--shadow-card)' }}>
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ background: 'var(--table-alt)' }}>
            {['Task', 'Status', 'Priority', 'SP', 'Assigned', 'Sprint'].map((h, i) => (
              <th
                key={h}
                className={`px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider ${i >= 2 ? 'hidden sm:table-cell' : ''} ${i >= 3 ? 'hidden md:table-cell' : ''}`}
                style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((t, i) => (
            <tr
              key={t.id}
              onClick={() => onTaskClick(t)}
              className="cursor-pointer transition-colors"
              style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-alt)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td className="px-4 py-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{t.taskName}</td>
              <td className="px-4 py-3"><Badge value={t.status} /></td>
              <td className="px-4 py-3 hidden sm:table-cell">
                {t.priority ? <Badge value={t.priority} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
              </td>
              <td className="px-4 py-3 hidden md:table-cell font-mono text-[12px]" style={{ color: 'var(--text-muted)' }}>{t.storyPoints}</td>
              <td className="px-4 py-3 hidden sm:table-cell text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                {t.assignedTo?.fullName || <span style={{ color: 'var(--text-muted)' }}>—</span>}
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                {t.sprint?.sprintName || <span style={{ color: 'var(--text-muted)' }}>Backlog</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
