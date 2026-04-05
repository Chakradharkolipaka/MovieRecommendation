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
    },
  },
  plugins: [],
};
