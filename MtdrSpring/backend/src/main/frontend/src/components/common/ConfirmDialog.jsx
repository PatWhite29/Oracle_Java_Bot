import React, { useEffect } from 'react';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading = false,
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Accent bar */}
        <div
          className="h-1 w-full"
          style={{
            background: isDanger
              ? 'linear-gradient(90deg, #C74634, #9E3829)'
              : 'linear-gradient(90deg, #003865, #005587)',
          }}
        />

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: isDanger ? '#F9DDD9' : '#E8F0F7' }}
            >
              {isDanger ? (
                <svg className="w-5 h-5" style={{ color: '#C74634' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                <svg className="w-5 h-5" style={{ color: '#003865' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-gray-900 text-[15px]">{title}</h3>
              {message && (
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{
                background: isDanger ? '#C74634' : '#003865',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = isDanger ? '#9E3829' : '#001C33'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isDanger ? '#C74634' : '#003865'; }}
            >
              {loading ? 'Loading…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
