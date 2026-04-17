import React from 'react';
import SprintCard from './SprintCard';

export default function SprintList({ sprints, isManager, onActivate, onClose, onSelect }) {
  if (sprints.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No sprints yet.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sprints.map((s) => (
        <SprintCard key={s.id} sprint={s} isManager={isManager} onActivate={onActivate} onClose={onClose} onSelect={onSelect} />
      ))}
    </div>
  );
}
