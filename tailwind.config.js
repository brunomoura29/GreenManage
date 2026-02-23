/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Manual toggle for premium feel control
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        // Verde Principal: #01573C
        primary: {
          50: '#f0fdf7',
          100: '#dbfbe9',
          200: '#bbf7d6',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#01573C', // Main Brand Color adjusted to 700 scale for better text contrast if needed, or keeping exact.
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          DEFAULT: '#01573C',
        },
        // Verde Secundário: #01C57A
        secondary: {
          50: '#effef7',
          100: '#dafeec',
          200: '#b8fadd',
          300: '#81f4c7',
          400: '#42e8aa',
          500: '#01C57A', // Main Secondary Color
          600: '#00a866',
          700: '#008453',
          800: '#066844',
          900: '#06563a',
          950: '#023021',
          DEFAULT: '#01C57A'
        },
        // Neutrals for premium feel
        background: {
          light: '#FFFFFF',
          dark: '#0f172a', // Slate 900
        },
        surface: {
          light: '#F8FAFC', // Slate 50
          dark: '#1e293b', // Slate 800
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}
