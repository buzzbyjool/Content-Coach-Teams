/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5DB6BB',
          dark: '#4A9296'
        }
      }
    },
  },
  plugins: [],
};
