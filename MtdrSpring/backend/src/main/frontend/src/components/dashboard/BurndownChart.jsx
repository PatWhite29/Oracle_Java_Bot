import React from 'react';

export default function BurndownChart({ data }) {
  if (!data || !data.entries || data.entries.length === 0) {
    return <p className="text-sm text-gray-400">No burndown data.</p>;
  }

  const { entries, totalPoints } = data;
  const max = totalPoints || 1;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>Start: {totalPoints} SP</span>
        <span>Remaining</span>
      </div>
      {entries.map((e) => (
        <div key={e.date} className="flex items-center gap-3 text-xs">
          <span className="w-24 text-gray-400">{e.date}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 bg-blue-400 rounded-full"
              style={{ width: `${(e.remainingPoints / max) * 100}%` }}
            />
          </div>
          <span className="text-gray-500 w-8 text-right">{e.remainingPoints}</span>
        </div>
      ))}
    </div>
  );
}
