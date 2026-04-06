/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#12121a',
        primary: '#e50914',
        accent: '#f5a623',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        heading: ['Cinzel', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-amber': 'pulseAmber 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulseAmber: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(245,166,35,0)' },
          '50%': { boxShadow: '0 0 12px 2px rgba(245,166,35,0.25)' },
        },
      },
    },
  },
  plugins: [],
};
