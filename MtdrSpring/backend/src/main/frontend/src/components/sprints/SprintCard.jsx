import React from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';

const fmt = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
};

export default function SprintCard({ sprint, isManager, onActivate, onClose, onReopen, onSelect }) {
  return (
    <div
      onClick={() => onSelect(sprint)}
      className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3 cursor-pointer hover:border-gray-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{sprint.sprintName}</h3>
          {sprint.goal && <p className="text-xs text-gray-500 mt-0.5">{sprint.goal}</p>}
        </div>
        <Badge value={sprint.status} />
      </div>
      <div className="text-xs text-gray-400">
        {fmt(sprint.startDate)} → {fmt(sprint.endDate)}
      </div>
      {isManager && sprint.status !== 'CLOSED' && (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {sprint.status === 'PLANNING' && (
            <>
              <Button variant="secondary" onClick={() => onActivate(sprint)}>Activate</Button>
              <Button variant="danger" onClick={() => onClose(sprint)}>Close</Button>
            </>
          )}
          {sprint.status === 'ACTIVE' && (
            <Button variant="danger" onClick={() => onClose(sprint)}>Close sprint</Button>
          )}
        </div>
      )}
      {isManager && sprint.status === 'CLOSED' && (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" onClick={() => onReopen(sprint)}>Reopen</Button>
        </div>
      )}
    </div>
  );
}
