import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

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

/**
 * Props:
 *   value        — current selected value ('' = placeholder)
 *   onChange     — (value: string) => void
 *   options      — [{ value, label }]
 *   placeholder  — string shown when value === ''
 *   showDot      — bool, show colored dot
 *   fullWidth    — bool, button takes full width of container (for forms)
 */
export default function FilterSelect({
  value, onChange, options, placeholder = 'All', showDot = false, fullWidth = false,
}) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  const updatePosition = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const maxH = Math.min(240, Math.max(spaceBelow, spaceAbove) - 6);
    const openBelow = spaceBelow >= spaceAbove || spaceBelow >= 120;
    setDropdownStyle({
      position: 'fixed',
      ...(openBelow
        ? { top: rect.bottom + 6 }
        : { bottom: window.innerHeight - rect.top + 6 }),
      left: rect.left,
      minWidth: Math.max(rect.width, 160),
      maxHeight: maxH,
      overflowY: 'auto',
      zIndex: 9999,
    });
  };

  const handleOpen = () => {
    updatePosition();
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) setOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    const reposition = () => updatePosition();
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  const selectedLabel = value
    ? (options.find((o) => o.value === value)?.label ?? value)
    : placeholder;
  const isEmpty = !value;

  const dropdown = open && ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      style={{
        ...dropdownStyle,
        background: 'var(--dd-bg)',
        borderRadius: 12,
        border: '1px solid var(--dd-border)',
        boxShadow: '0 8px 24px var(--shadow-drop)',
        paddingTop: 4,
        paddingBottom: 4,
      }}
    >
      {/* Clear / placeholder option */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onChange(''); setOpen(false); }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          padding: '8px 12px', fontSize: 12, fontWeight: 600,
          color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {placeholder}
      </button>

      <div style={{ height: 1, background: 'var(--dd-divider)', margin: '2px 8px' }} />

      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { onChange(opt.value); setOpen(false); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', fontSize: 13, border: 'none', cursor: 'pointer',
              background: selected ? 'var(--dd-selected)' : 'transparent',
              color: selected ? 'var(--dd-selected-fg)' : 'var(--text-primary)',
              fontWeight: selected ? 600 : 400,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--dd-hover)'; }}
            onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
          >
            {showDot && (
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: DOT_COLORS[opt.value] ?? '#9CA3AF',
              }} />
            )}
            <span style={{ flex: 1 }}>{opt.label}</span>
            {selected && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--dd-selected-fg)" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        );
      })}
    </div>,
    document.body
  );

  return (
    <div style={{ position: 'relative', width: fullWidth ? '100%' : undefined }}>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 border rounded-lg px-3 py-1.5 text-sm font-medium transition-all focus:outline-none"
        style={{
          width: fullWidth ? '100%' : undefined,
          background: open ? 'var(--bg-card-alt)' : 'var(--bg-input)',
          borderColor: open ? '#005587' : 'var(--dd-border)',
          color: isEmpty ? 'var(--text-muted)' : 'var(--text-primary)',
          boxShadow: open ? '0 0 0 3px rgba(0,85,135,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        {showDot && value && (
          <span style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: DOT_COLORS[value] ?? '#9CA3AF',
          }} />
        )}
        <span className="whitespace-nowrap flex-1 text-left">{selectedLabel}</span>
        <ChevronIcon open={open} />
      </button>

      {dropdown}
    </div>
  );
}
