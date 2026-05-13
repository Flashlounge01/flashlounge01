/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        flash: {
          yellow: '#F5C518',
          gold: '#D4AF37',
          black: '#0A0A0A',
          dark: '#111111',
          card: '#1A1A1A',
          border: '#2A2A2A',
          muted: '#888888',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #F5C518, 0 0 10px #F5C518' },
          '50%': { boxShadow: '0 0 20px #F5C518, 0 0 40px #F5C518' },
        },
      },
      backgroundImage: {
        'flash-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A00 50%, #0A0A0A 100%)',
        'yellow-glow': 'radial-gradient(ellipse at center, rgba(245,197,24,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
};
