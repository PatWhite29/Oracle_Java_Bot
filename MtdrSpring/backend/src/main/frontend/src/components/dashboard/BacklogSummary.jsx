import React from 'react';
import Badge from '../common/Badge';

export default function BacklogSummary({ data }) {
  if (!data) return <p className="text-sm text-gray-400">No backlog data.</p>;

  const priorities = [
    { label: 'HIGH', count: data.highPriorityTasks },
    { label: 'MEDIUM', count: data.mediumPriorityTasks },
    { label: 'LOW', count: data.lowPriorityTasks },
    { label: 'NONE', count: data.noPriorityTasks },
  ].filter((p) => p.count > 0);

  return (
    <div className="space-y-3">
      <div className="flex gap-6 text-sm text-gray-600">
        <span>Total tasks: <strong>{data.totalTasks}</strong></span>
        <span>Total SP: <strong>{data.totalStoryPoints}</strong></span>
      </div>
      {priorities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {priorities.map(({ label, count }) => (
            <div key={label} className="flex items-center gap-1">
              <Badge value={label} />
              <span className="text-xs text-gray-500">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
