/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Identidade EYE Agência
        eye: {
          red: '#E11D2A',
          'red-dark': '#B0151F',
          'red-soft': '#3A1416',
          charcoal: '#2D2D2D',
        },
        // Superfícies dark
        ink: {
          950: '#0A0A0A',
          900: '#101012',
          850: '#16161A',
          800: '#1C1C21',
          750: '#23232A',
          700: '#2C2C34',
          600: '#3A3A44',
        },
        // Texto
        cloud: {
          DEFAULT: '#F5F5F7',
          muted: '#A1A1AA',
          dim: '#6B6B74',
        },
      },
      fontFamily: {
        display: ['"Archivo"', '"Archivo Narrow"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(225,29,42,0.25), 0 8px 30px -8px rgba(225,29,42,0.35)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 40px -20px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        'hud-grid':
          'linear-gradient(rgba(225,29,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(225,29,42,0.06) 1px, transparent 1px)',
        'red-fade':
          'radial-gradient(120% 120% at 0% 0%, rgba(225,29,42,0.12) 0%, rgba(225,29,42,0) 45%)',
      },
      backgroundSize: {
        'hud-grid': '32px 32px',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'fade-in': 'fade-in 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
