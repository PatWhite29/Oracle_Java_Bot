/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#003865',
          mid:     '#005587',
          light:   '#E8F0F7',
          deep:    '#001C33',
        },
        oracle: {
          DEFAULT: '#C74634',
          dark:    '#9E3829',
          light:   '#F9DDD9',
        },
      },
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'shrink': {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.25s ease-out',
        'shrink': 'shrink 4s linear forwards',
      },
    },
  },
  plugins: [],
};
