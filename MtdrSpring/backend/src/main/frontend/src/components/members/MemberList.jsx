import React from 'react';
import Button from '../common/Button';

function CrownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 19h20v2H2v-2zM2 6l5 7 5-7 5 7 5-7v11H2V6z"/>
    </svg>
  );
}

export default function MemberList({ members, managerId, currentUserId, isManager, onRemove, onTransfer }) {
  return (
    <div className="space-y-2">
      {members.map((m) => {
        const isThisManager = m.id === managerId;
        const isSelf = m.id === currentUserId;
        return (
          <div key={m.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              {isThisManager && <CrownIcon />}
              <div>
                <p className="text-sm font-medium text-gray-800">{m.fullName}</p>
                <p className="text-xs text-gray-400">{m.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isThisManager && (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Manager</span>
              )}
              {isManager && !isThisManager && !isSelf && (
                <>
                  <Button variant="ghost" onClick={() => onTransfer(m)}>Transfer</Button>
                  <Button variant="ghost" onClick={() => onRemove(m)}>Remove</Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
