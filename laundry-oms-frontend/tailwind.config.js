/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fef2f2',
          100: '#fde6e6',
          200: '#fbd0d0',
          300: '#f7a8a8',
          400: '#f07575',
          500: '#e54545',
          600: '#c62828',
          700: '#a52222',
          800: '#891f1f',
          900: '#721f1f',
        },
        surface: {
          50:  '#faf9f7',
          100: '#f5f3f0',
          200: '#eae7e1',
          300: '#dcd7cf',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
