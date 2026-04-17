import React from 'react';
import Badge from '../common/Badge';

export default function BacklogSummary({ data }) {
  if (!data) return null;
  return (
    <div className="space-y-3">
      <div className="flex gap-6 text-sm text-gray-600">
        <span>Total tasks: <strong>{data.totalTasks}</strong></span>
        <span>Total SP: <strong>{data.totalStoryPoints}</strong></span>
      </div>
      {data.byPriority && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.byPriority).map(([priority, count]) => (
            <div key={priority} className="flex items-center gap-1">
              <Badge value={priority} />
              <span className="text-xs text-gray-500">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
