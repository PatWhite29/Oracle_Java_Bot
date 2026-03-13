import React from 'react';

function StatusBadge({ status }) {
  const normalizedStatus = (status || '').toLowerCase();
  const statusClass = normalizedStatus === 'completed' ? 'completed' : 'pending';

  return <span className={`status-badge ${statusClass}`}>{status}</span>;
}

export default StatusBadge;
