import React from 'react';
import Badge from '../common/Badge';

export default function SprintSummary({ data }) {
  if (!data) return <p className="text-sm text-gray-400">No active sprint.</p>;

  const tasksByStatus = [
    { status: 'TODO', count: data.todoTasks },
    { status: 'IN_PROGRESS', count: data.inProgressTasks },
    { status: 'BLOCKED', count: data.blockedTasks },
    { status: 'DONE', count: data.doneTasks },
  ];

  return (
    <div className="space-y-4">
      {data.sprintName && (
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{data.sprintName}</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tasksByStatus.map(({ status, count }) => (
          <div key={status} className="bg-gray-50 rounded-lg p-3 text-center">
            <Badge value={status} />
            <p className="text-2xl font-bold text-gray-800 mt-2">{count ?? 0}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-6 text-sm text-gray-600">
        <span>Committed: <strong>{data.spCommitted}</strong> SP</span>
        <span>Completed: <strong>{data.spCompleted}</strong> SP</span>
        <span>Completion: <strong>{data.completionPercent?.toFixed(0)}%</strong></span>
      </div>
    </div>
  );
}
