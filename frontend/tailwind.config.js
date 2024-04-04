/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      body: ['DM Sans'],
      display: ['DM Sans']
    },
    extend: {
      transitionProperty: {
        width: 'width',
        height: 'height',
      },
      animation: {
        fastPulse: 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        'aws-squid-ink': '#40444c',   // Side bar
        'aws-sea-blue': '#7c03ff',    // Model hover, chat button icons
        'aws-sea-blue-hover': '#7c03ff',  // Side bar hover, menu
        'aws-aqua': '#007faa',
        'aws-lab': '#38ef7d',
        'aws-mist': '#9ffcea',
        'aws-font-color': '#232F3E',
        'aws-font-color-white': '#ffffff',
        'aws-paper': '#f1f3f3',
        red: '#dc2626',
        'light-red': '#fee2e2',
        yellow: '#f59e0b',
        'light-yellow': '#fef9c3',
        'dark-gray': '#6b7280',
        gray: '#9ca3af',
        'light-gray': '#e5e7eb',
      },
    },
  },
  // eslint-disable-next-line no-undef
  plugins: [require('@tailwindcss/typography'), require('tailwind-scrollbar')],
};
