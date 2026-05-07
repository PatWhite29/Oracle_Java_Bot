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
      className="rounded-xl p-4 cursor-pointer flex flex-col gap-3 transition-all duration-150"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        boxShadow: hovered ? '0 6px 18px var(--shadow-drop)' : '0 1px 3px var(--shadow-card)',
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
            <h3 className="font-display font-bold text-[13px] leading-snug truncate" style={{ color: 'var(--text-primary)' }}>
              {sprint.sprintName}
            </h3>
            {sprint.goal && (
              <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{sprint.goal}</p>
            )}
          </div>
        </div>
        <Badge value={sprint.status} />
      </div>

      <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
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
                className="px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors"
                style={{ color: 'var(--text-primary)', background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}
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
            className="px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors"
            style={{ color: 'var(--text-primary)', background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}
          >
            Reopen
          </button>
        </div>
      )}
    </div>
  );
}
