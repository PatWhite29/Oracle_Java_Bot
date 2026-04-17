import React from 'react';

export default function VelocityChart({ data }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400">No velocity data.</p>;

  const max = Math.max(...data.map((d) => d.storyPointsCompleted || 0), 1);

  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.sprintId} className="flex items-center gap-3 text-sm">
          <span className="w-32 text-gray-500 truncate">{d.sprintName}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-4 bg-gray-800 rounded-full transition-all"
              style={{ width: `${((d.storyPointsCompleted || 0) / max) * 100}%` }}
            />
          </div>
          <span className="text-gray-600 w-10 text-right">{d.storyPointsCompleted}</span>
        </div>
      ))}
    </div>
  );
}
