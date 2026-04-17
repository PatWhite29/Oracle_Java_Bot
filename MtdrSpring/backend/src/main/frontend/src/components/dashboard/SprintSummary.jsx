import React from 'react';
import Badge from '../common/Badge';

export default function SprintSummary({ data }) {
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(data.tasksByStatus || {}).map(([status, count]) => (
          <div key={status} className="bg-gray-50 rounded-lg p-3 text-center">
            <Badge value={status} />
            <p className="text-2xl font-bold text-gray-800 mt-2">{count}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-6 text-sm text-gray-600">
        <span>Committed: <strong>{data.committedPoints}</strong> SP</span>
        <span>Completed: <strong>{data.completedPoints}</strong> SP</span>
        <span>Completion: <strong>{data.completionPercentage?.toFixed(0)}%</strong></span>
      </div>
    </div>
  );
}
