import React from 'react';

const variants = {
  primary:   'bg-navy text-white hover:bg-navy-deep',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200',
  danger:    'bg-red-600 text-white hover:bg-red-700',
  ghost:     'text-gray-600 hover:bg-gray-100',
  outline:   'border border-navy text-navy hover:bg-navy-light',
};

export default function Button({ children, variant = 'primary', className = '', disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-navy/40
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
