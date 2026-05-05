import React from 'react';

function initials(name) {
  return name?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?';
}

export default function MemberList({ members, managerId, currentUserId, isManager, onRemove, onTransfer }) {
  return (
    <div className="space-y-2">
      {members.map((m) => {
        const isThisManager = m.id === managerId;
        const isSelf = m.id === currentUserId;
        return (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 1px 3px var(--shadow-card)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                style={
                  isThisManager
                    ? { background: '#C74634', color: 'white' }
                    : { background: '#E8F0F7', color: '#003865' }
                }
              >
                {initials(m.fullName)}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {m.fullName}
                  {isSelf && <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>You</span>}
                </p>
                <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{m.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isThisManager && (
                <span className="text-[11px] font-bold text-oracle bg-oracle-light px-2 py-0.5 rounded-full">
                  Manager
                </span>
              )}
              {isManager && !isThisManager && !isSelf && (
                <>
                  <button
                    onClick={() => onTransfer(m)}
                    className="text-[12px] font-semibold text-gray-500 hover:text-navy transition-colors px-2 py-1"
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => onRemove(m)}
                    className="text-[12px] font-semibold text-oracle hover:text-oracle-dark transition-colors px-2 py-1"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
