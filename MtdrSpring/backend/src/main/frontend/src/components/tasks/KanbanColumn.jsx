import React from 'react';
import TaskCard from './TaskCard';

const COLORS = {
  TODO: 'border-gray-300',
  IN_PROGRESS: 'border-blue-400',
  BLOCKED: 'border-red-400',
  DONE: 'border-green-400',
};

export default function KanbanColumn({ status, tasks, onTaskClick }) {
  const color = COLORS[status] || 'border-gray-300';
  return (
    <div className={`flex flex-col min-w-[220px] w-full bg-gray-50 rounded-xl border-t-4 ${color} p-3 gap-2`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{status.replace('_', ' ')}</span>
        <span className="text-xs text-gray-400">{tasks.length}</span>
      </div>
      {tasks.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
      )}
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} onClick={onTaskClick} />
      ))}
    </div>
  );
}
