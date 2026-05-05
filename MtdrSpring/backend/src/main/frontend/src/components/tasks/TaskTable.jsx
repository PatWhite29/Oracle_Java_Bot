import React from 'react';
import Badge from '../common/Badge';

export default function TaskTable({ tasks, onTaskClick }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No tasks found.</p>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ background: '#FAFAFA' }}>
            {['Task', 'Status', 'Priority', 'SP', 'Assigned', 'Sprint'].map((h, i) => (
              <th
                key={h}
                className={`px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 ${i >= 2 ? 'hidden sm:table-cell' : ''} ${i >= 3 ? 'hidden md:table-cell' : ''}`}
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
              className="cursor-pointer transition-colors hover:bg-gray-50"
              style={{ borderBottom: i < tasks.length - 1 ? '1px solid #F5F5F5' : 'none' }}
            >
              <td className="px-4 py-3 text-[13px] font-medium text-gray-900">{t.taskName}</td>
              <td className="px-4 py-3"><Badge value={t.status} /></td>
              <td className="px-4 py-3 hidden sm:table-cell">
                {t.priority ? <Badge value={t.priority} /> : <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3 hidden md:table-cell font-mono text-[12px] text-gray-400">{t.storyPoints}</td>
              <td className="px-4 py-3 hidden sm:table-cell text-[12px] text-gray-500">
                {t.assignedTo?.fullName || <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-[12px] text-gray-500">
                {t.sprint?.sprintName || <span className="text-gray-300">Backlog</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
