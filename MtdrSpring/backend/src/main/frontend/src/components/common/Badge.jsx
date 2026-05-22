import React from 'react';

const statusColors = {
  TODO:        'bg-gray-100 text-gray-700        dark:bg-slate-800 dark:text-slate-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-700        dark:bg-[#1C2B42] dark:text-[#7EB8F0]',
  BLOCKED:     'bg-red-100 text-red-700          dark:bg-[#271D1D] dark:text-[#E08A8A]',
  DONE:        'bg-green-100 text-green-700      dark:bg-[#1B2A22] dark:text-[#6DC98A]',
  PLANNING:    'bg-yellow-100 text-yellow-700    dark:bg-[#252010] dark:text-[#D4A85A]',
  ACTIVE:      'bg-blue-100 text-blue-700        dark:bg-[#1C2B42] dark:text-[#7EB8F0]',
  CLOSED:      'bg-gray-100 text-gray-500        dark:bg-slate-800 dark:text-slate-500',
  PAUSED:      'bg-orange-100 text-orange-700    dark:bg-[#261F12] dark:text-[#D49060]',
  LOW:         'bg-gray-100 text-gray-600        dark:bg-slate-800 dark:text-slate-400',
  MEDIUM:      'bg-yellow-100 text-yellow-700    dark:bg-[#252010] dark:text-[#D4A85A]',
  HIGH:        'bg-red-100 text-red-700          dark:bg-[#271D1D] dark:text-[#E08A8A]',
};

export default function Badge({ value, className = '' }) {
  const color = statusColors[value] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${color} ${className}`}>
      {value?.replace('_', ' ')}
    </span>
  );
}
