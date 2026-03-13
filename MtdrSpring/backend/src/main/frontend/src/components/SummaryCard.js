import React from 'react';

function SummaryCard({ label, value, accentClass }) {
  return (
    <div className="summary-card">
      <div className={`summary-accent ${accentClass || ''}`.trim()} />
      <p className="summary-label">{label}</p>
      <strong className="summary-value">{value}</strong>
    </div>
  );
}

export default SummaryCard;
