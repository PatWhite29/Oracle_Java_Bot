import React from 'react';

export default function ExportCsvButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Exportar CSV"
      className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md transition-colors hover:opacity-75"
      style={{ color: 'var(--text-secondary)', background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 8.5L2.5 5H5V1h2v4h2.5L6 8.5z" />
        <path d="M1 10.5h10v-1H1v1z" />
      </svg>
      CSV
    </button>
  );
}
