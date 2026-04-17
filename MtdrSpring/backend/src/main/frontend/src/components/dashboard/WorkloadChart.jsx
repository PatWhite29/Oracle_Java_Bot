import React from 'react';
import Badge from '../common/Badge';

export default function WorkloadChart({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400">No workload data.</p>;

  return (
    <div className="space-y-4">
      {data.map((member) => (
        <div key={member.userId} className="space-y-1">
          <p className="text-sm font-medium text-gray-700">{member.fullName}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(member.tasksByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center gap-1">
                <Badge value={status} />
                <span className="text-xs text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
