/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A864D',
        secondary: '#EF9334',
        background: '#F9FAFB',
        foreground: '#111827',
      },
    },
  },
  plugins: [],
};
