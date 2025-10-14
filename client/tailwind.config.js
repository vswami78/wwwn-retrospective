/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'like': '#10b981', // green
        'wish': '#a855f7', // purple
      }
    },
  },
  plugins: [],
}
