/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", 
    "./src/**/*.{vue,js,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#15803d',   // hijau gelap
        secondary: '#facc15', // kuning cerah
      }
    },
  },
  plugins: [],
}
