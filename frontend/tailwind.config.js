/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0167BA',
        secondary: '#a3b18a',
        dark: '#04152D',
        accent: '#0167BA',
      },
    },
  },
  plugins: [],
}
