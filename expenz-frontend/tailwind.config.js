// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      colors: {
        forest: {
          50: '#f0f7f4',
          100: '#d9ece2',
          200: '#b5d9c6',
          300: '#85bfa3',
          400: '#5a9f7e',
          500: '#3d8365',
          600: '#2d6a50',
          700: '#265541',
          800: '#214536',
          900: '#1c392d',
          950: '#0f201a',
        },
        sage: {
          50: '#f6f7f4',
          100: '#e8eae2',
          200: '#d2d6c7',
          300: '#b4bba3',
          400: '#969f82',
          500: '#7a8466',
          600: '#606a4f',
          700: '#4c5440',
          800: '#3f4536',
          900: '#363b2f',
        },
      },
      backgroundImage: {
        'gradient-forest': 'linear-gradient(135deg, #2d6a50 0%, #1c392d 100%)',
        'gradient-sage': 'linear-gradient(135deg, #3d8365 0%, #265541 100%)',
        'gradient-leaf': 'linear-gradient(135deg, #5a9f7e 0%, #2d6a50 100%)',
      },
      boxShadow: {
        'forest': '0 4px 20px rgba(45, 106, 80, 0.15)',
        'card': '0 2px 16px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}