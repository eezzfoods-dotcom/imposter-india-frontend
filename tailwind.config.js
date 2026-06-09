/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bebas Neue', 'cursive'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          pink:   '#E91E63',
          purple: '#9C27B0',
          dark:   '#0a0220',
          card:   '#1a0533',
        },
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease forwards',
        'pulse-dot': 'pulseDot 0.8s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%,80%,100%': { transform: 'scale(0.7)', opacity: 0.5 },
          '40%':          { transform: 'scale(1)',   opacity: 1   },
        },
      },
    },
  },
  plugins: [],
};
