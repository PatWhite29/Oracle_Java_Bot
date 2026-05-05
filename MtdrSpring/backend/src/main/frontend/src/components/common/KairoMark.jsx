import React from 'react';

const VARIANTS = {
  dark: {
    bg:           '#003865',
    bgBorder:     'rgba(255,255,255,0.10)',
    stroke:       'white',
    originFill:   '#003865',
    originStroke: 'white',
    endFill:      'white',
    midFill:      'white',
    midDot:       '#003865',
  },
  light: {
    bg:           '#EEF5FB',
    bgBorder:     '#B8D4E8',
    stroke:       '#003865',
    originFill:   'white',
    originStroke: '#003865',
    endFill:      '#003865',
    midFill:      '#003865',
    midDot:       'white',
  },
  oracle: {
    bg:           '#EEF5FB',
    bgBorder:     '#B8D4E8',
    stroke:       '#003865',
    originFill:   'white',
    originStroke: '#003865',
    endFill:      '#C74634',
    midFill:      '#003865',
    midDot:       'white',
  },
  mono: {
    bg:           'white',
    bgBorder:     '#E5E7EB',
    stroke:       '#111111',
    originFill:   'white',
    originStroke: '#111111',
    endFill:      '#111111',
    midFill:      '#111111',
    midDot:       'white',
  },
};

const RADIUS = {
  rounded: 18,
  circle:  40,
  sharp:   8,
  bare:    null,
};

export default function KairoMark({ size = 36, variant = 'dark', shape = 'rounded' }) {
  const v = VARIANTS[variant] ?? VARIANTS.dark;
  const rx = RADIUS[shape] ?? RADIUS.rounded;
  const bare = shape === 'bare';

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ flexShrink: 0 }}>
      {!bare && (
        <>
          <rect width="80" height="80" rx={rx} fill={v.bg} />
          <rect x="1" y="1" width="78" height="78" rx={rx - 1} stroke={v.bgBorder} strokeWidth="1.5" fill="none" />
        </>
      )}

      {/* Strokes */}
      <line x1="23" y1="18" x2="23" y2="62" stroke={v.stroke} strokeWidth="3" strokeLinecap="round" />
      <line x1="23" y1="40" x2="55" y2="18" stroke={v.stroke} strokeWidth="3" strokeLinecap="round" />
      <line x1="23" y1="40" x2="55" y2="62" stroke={v.stroke} strokeWidth="3" strokeLinecap="round" />

      {/* Origin nodes (top-left, bottom-left) */}
      <circle cx="23" cy="18" r="5" fill={v.originFill} stroke={v.originStroke} strokeWidth="2.5" />
      <circle cx="23" cy="62" r="5" fill={v.originFill} stroke={v.originStroke} strokeWidth="2.5" />

      {/* Endpoint nodes (top-right, bottom-right) */}
      <circle cx="55" cy="18" r="5" fill={v.endFill} />
      <circle cx="55" cy="62" r="5" fill={v.endFill} />

      {/* Mid node (center-left) */}
      <circle cx="23" cy="40" r="7" fill={v.midFill} />
      <circle cx="23" cy="40" r="3.5" fill={v.midDot} />
    </svg>
  );
}
