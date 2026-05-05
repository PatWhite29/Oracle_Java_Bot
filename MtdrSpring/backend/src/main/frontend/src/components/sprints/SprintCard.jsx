import React, { useState } from 'react';
import Badge from '../common/Badge';

const fmt = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const STATUS_DOT = {
  ACTIVE:   '#1D4ED8',
  PLANNING: '#6B7280',
  CLOSED:   '#9CA3AF',
};

export default function SprintCard({ sprint, isManager, onActivate, onClose, onReopen, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(sprint)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-xl p-4 cursor-pointer flex flex-col gap-3 transition-all duration-150"
      style={{
        border: `1px solid ${hovered ? '#D1D5DB' : '#E5E7EB'}`,
        boxShadow: hovered ? '0 6px 18px rgba(0,0,0,0.09)' : '0 1px 3px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2 h-2 rounded-full shrink-0 mt-0.5"
            style={{ background: STATUS_DOT[sprint.status] ?? '#6B7280' }}
          />
          <div className="min-w-0">
            <h3 className="font-display font-bold text-gray-900 text-[13px] leading-snug truncate">
              {sprint.sprintName}
            </h3>
            {sprint.goal && (
              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{sprint.goal}</p>
            )}
          </div>
        </div>
        <Badge value={sprint.status} />
      </div>

      <p className="text-[11px] text-gray-400 font-mono">
        {fmt(sprint.startDate)} → {fmt(sprint.endDate)}
      </p>

      {isManager && sprint.status !== 'CLOSED' && (
        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          {sprint.status === 'PLANNING' && (
            <>
              <button
                onClick={() => onActivate(sprint)}
                className="px-3 py-1 rounded-lg text-[12px] font-semibold text-white bg-navy hover:bg-navy-deep transition-colors"
              >
                Activate
              </button>
              <button
                onClick={() => onClose(sprint)}
                className="px-3 py-1 rounded-lg text-[12px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
              >
                Close
              </button>
            </>
          )}
          {sprint.status === 'ACTIVE' && (
            <button
              onClick={() => onClose(sprint)}
              className="px-3 py-1 rounded-lg text-[12px] font-semibold text-oracle hover:bg-oracle-light border border-oracle/20 transition-colors"
            >
              Close sprint
            </button>
          )}
        </div>
      )}

      {isManager && sprint.status === 'CLOSED' && (
        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onReopen(sprint)}
            className="px-3 py-1 rounded-lg text-[12px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
          >
            Reopen
          </button>
        </div>
      )}
    </div>
  );
}
