import React from 'react';
import KanbanColumn from './KanbanColumn';

const STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

export default function KanbanBoard({ tasks, onTaskClick }) {
  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((s) => (
        <KanbanColumn key={s} status={s} tasks={byStatus[s]} onTaskClick={onTaskClick} />
      ))}
    </div>
  );
}
