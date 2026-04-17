import React from 'react';
import Button from '../common/Button';

export default function MemberList({ members, managerId, currentUserId, isManager, onRemove }) {
  return (
    <div className="space-y-2">
      {members.map((m) => {
        const isThisManager = m.id === managerId;
        const isSelf = m.id === currentUserId;
        return (
          <div key={m.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{m.fullName}</p>
              <p className="text-xs text-gray-400">{m.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {isThisManager && (
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Manager</span>
              )}
              {isManager && !isThisManager && !isSelf && (
                <Button variant="ghost" onClick={() => onRemove(m)}>Remove</Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
