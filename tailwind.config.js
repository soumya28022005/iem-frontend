/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#6366f1',600:'#4f46e5',700:'#4338ca',800:'#3730a3',900:'#312e81' },
        surface: { 50:'#f8f9fb',100:'#f1f3f6',200:'#e8ebf0',700:'#1e2130',800:'#161827',900:'#0f1120',950:'#090b14' },
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        mono: ['JetBrains Mono','Fira Code','monospace'],
      },
      animation: {
        'fade-in':'fadeIn 0.15s ease-out',
        'slide-up':'slideUp 0.2s ease-out',
        'shimmer':'shimmer 1.5s infinite',
        'blink':'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn:{ from:{opacity:0}, to:{opacity:1} },
        slideUp:{ from:{opacity:0,transform:'translateY(8px)'}, to:{opacity:1,transform:'translateY(0)'} },
        shimmer:{ '0%':{backgroundPosition:'-200% 0'}, '100%':{backgroundPosition:'200% 0'} },
        blink:{ '0%,100%':{opacity:1}, '50%':{opacity:0} },
      },
      boxShadow: {
        'glow':'0 0 20px rgba(99,102,241,0.3)',
        'glow-sm':'0 0 10px rgba(99,102,241,0.2)',
      },
    },
  },
  plugins: [],
};