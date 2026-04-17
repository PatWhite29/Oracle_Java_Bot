import React from 'react';
import Badge from '../common/Badge';

export default function WorkloadChart({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400">No workload data.</p>;

  return (
    <div className="space-y-4">
      {data.map((member) => {
        const breakdown = [
          { status: 'TODO', count: member.todoTasks },
          { status: 'IN_PROGRESS', count: member.inProgressTasks },
          { status: 'BLOCKED', count: member.blockedTasks },
          { status: 'DONE', count: member.doneTasks },
        ].filter((e) => e.count > 0);
        return (
          <div key={member.userId} className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">{member.fullName}</p>
              <span className="text-xs text-gray-400">{member.totalTasks} tasks</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {breakdown.length === 0
                ? <span className="text-xs text-gray-400">No active tasks</span>
                : breakdown.map(({ status, count }) => (
                  <div key={status} className="flex items-center gap-1">
                    <Badge value={status} />
                    <span className="text-xs text-gray-500">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
