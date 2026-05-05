import React, { useState, useRef, useEffect } from 'react';

const DOT_COLORS = {
  TODO:        '#6B7280',
  IN_PROGRESS: '#1D4ED8',
  BLOCKED:     '#C74634',
  DONE:        '#15803D',
  LOW:         '#6B7280',
  MEDIUM:      '#D97706',
  HIGH:        '#C74634',
  PLANNING:    '#D97706',
  ACTIVE:      '#1D4ED8',
  CLOSED:      '#9CA3AF',
};

const ChevronIcon = ({ open }) => (
  <svg
    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
    className="transition-transform duration-150 shrink-0"
    style={{ transform: open ? 'rotate(180deg)' : 'none' }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

function Dot({ value }) {
  const color = DOT_COLORS[value];
  if (!color) return null;
  return <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />;
}

function label(value, options) {
  return options.find((o) => o.value === value)?.label ?? value;
}

/**
 * Props:
 *   value        — current selected value ('' = placeholder)
 *   onChange     — (value) => void
 *   options      — [{ value, label }]
 *   placeholder  — string shown when value === ''
 *   showDot      — bool, show colored dot next to label
 */
export default function FilterSelect({ value, onChange, options, placeholder = 'All', showDot = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc); };
  }, [open]);

  const selectedLabel = value ? label(value, options) : placeholder;
  const isEmpty = !value;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 border rounded-lg px-3 py-1.5 text-sm font-medium transition-all focus:outline-none"
        style={{
          background: open ? '#F0F4F8' : 'white',
          borderColor: open ? '#005587' : '#E5E7EB',
          color: isEmpty ? '#9CA3AF' : '#111827',
          boxShadow: open ? '0 0 0 3px rgba(0,85,135,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        {showDot && value && <Dot value={value} />}
        <span className="whitespace-nowrap">{selectedLabel}</span>
        <ChevronIcon open={open} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1.5 min-w-[160px] bg-white rounded-xl border border-gray-100 py-1 animate-in"
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.10)', top: '100%', left: 0 }}
        >
          {/* Clear option */}
          <button
            onClick={() => { onChange(''); setOpen(false); }}
            className="w-full flex items-center px-3 py-2 text-[12px] font-semibold text-gray-400 hover:bg-gray-50 transition-colors"
          >
            {placeholder}
          </button>

          <div className="h-px bg-gray-100 mx-2 my-1" />

          {options.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors"
                style={{
                  background: selected ? '#EFF6FF' : 'transparent',
                  color: selected ? '#003865' : '#374151',
                  fontWeight: selected ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = '#F9FAFB'; }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
              >
                {showDot && <Dot value={opt.value} />}
                <span className="flex-1 text-left">{opt.label}</span>
                {selected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003865" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
