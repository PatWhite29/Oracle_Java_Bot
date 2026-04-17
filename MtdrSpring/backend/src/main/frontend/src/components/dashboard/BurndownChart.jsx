import React from 'react';

export default function BurndownChart({ data }) {
  if (!data || !data.sprintId) {
    return <p className="text-sm text-gray-400">No active sprint burndown.</p>;
  }

  const total = data.totalStoryPoints || 1;
  const completed = data.completedStoryPoints || 0;
  const remaining = data.remainingStoryPoints || 0;
  const completedPct = Math.min((completed / total) * 100, 100);
  const idealPct = Math.min(data.idealBurnPercent || 0, 100);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{data.sprintName}</p>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Actual progress</span>
            <span>{completed} / {total} SP</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-4 bg-gray-800 rounded-full transition-all"
              style={{ width: `${completedPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Ideal pace</span>
            <span>{idealPct.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-4 bg-blue-300 rounded-full transition-all"
              style={{ width: `${idealPct}%` }}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-6 text-sm text-gray-600">
        <span>Remaining: <strong>{remaining} SP</strong></span>
        <span>Actual burn: <strong>{(data.actualBurnPercent || 0).toFixed(0)}%</strong></span>
      </div>
    </div>
  );
}
