/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': '#0ea5e9',
        'hover-primary-color': '#0369a1',
      }
    },
  },
  plugins: [],
}

