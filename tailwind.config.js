/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        'witcher-black': '#1a1a1a',
        'witcher-dark': '#2a2a2a',
        'witcher-gold': '#d4af37',
        'witcher-red': '#8b0000',
        'witcher-silver': '#c0c0c0',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'sans': ['Open Sans', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 0 15px rgba(212, 175, 55, 0.7)',
        'inner-gold': 'inset 0 0 10px rgba(212, 175, 55, 0.5)',
      },
      backgroundImage: {
        'metallic-gradient': 'linear-gradient(45deg, #707070, #c0c0c0, #707070)',
        'dark-gradient': 'linear-gradient(to bottom, rgba(26, 26, 26, 0.95), rgba(42, 42, 42, 0.9))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'shine': 'shine 2s infinite linear',
        'pulse-gold': 'pulse-gold 2s infinite',
        'float': 'float 3s infinite ease-in-out',
      },
      keyframes: {
        'shine': {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(212, 175, 55, 0.7)' },
          '50%': { boxShadow: '0 0 25px rgba(212, 175, 55, 0.9)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      textShadow: {
        'default': '0 2px 4px var(--shadow-color)',
        'sm': '0 1px 2px var(--shadow-color)',
        'gold': '0 0 5px rgba(212, 175, 55, 0.7)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add text-shadow plugin
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        },
        '.text-shadow-gold': {
          textShadow: '0 0 5px rgba(212, 175, 55, 0.7)'
        },
      };
      addUtilities(newUtilities);
    }
  ],
}

