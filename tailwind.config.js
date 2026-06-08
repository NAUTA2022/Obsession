// Brand color — morado del logo "obsesion" (#6850E8)
const brand = {
  50: '#f3f1ff',
  100: '#e9e5ff',
  200: '#d6cdff',
  300: '#b9a8ff',
  400: '#977dfb',
  500: '#6850e8',
  600: '#5836d4',
  700: '#4a2cb4',
  800: '#3e2893',
  900: '#352577',
  950: '#20154e',
};

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '2xl': '1536px',
      },
      colors: {
        primary: brand,
        // Alias: el antiguo azul de marca ahora renderiza el morado del logo
        // en toda la app sin tocar cada `blue-*` existente.
        blue: brand,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}