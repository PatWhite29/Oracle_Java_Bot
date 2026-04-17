import React from 'react';

export default function VelocityChart({ data, selectedSprintId }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400">No velocity data.</p>;

  const max = Math.max(...data.map((d) => d.storyPointsCompleted || 0), 1);

  return (
    <div className="space-y-2">
      {data.map((d) => {
        const isSelected = selectedSprintId && String(d.sprintId) === String(selectedSprintId);
        return (
          <div key={d.sprintId} className={`flex items-center gap-3 text-sm rounded-lg px-2 py-0.5 ${isSelected ? 'bg-gray-50 ring-1 ring-gray-300' : ''}`}>
            <span className={`w-32 truncate ${isSelected ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
              {d.sprintName}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all ${isSelected ? 'bg-gray-600' : 'bg-gray-800'}`}
                style={{ width: `${((d.storyPointsCompleted || 0) / max) * 100}%` }}
              />
            </div>
            <span className={`w-10 text-right ${isSelected ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
              {d.storyPointsCompleted}
            </span>
          </div>
        );
      })}
    </div>
  );
}
