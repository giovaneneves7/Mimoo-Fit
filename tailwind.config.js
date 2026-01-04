/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        coral: {
          50: '#fff5f2',
          100: '#ffe8e1',
          200: '#ffd4c7',
          300: '#ffb8a3',
          400: '#ff9276',
          500: '#FF7F6B',
          600: '#f45d47',
          700: '#e04331',
          800: '#b9392b',
          900: '#983528',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e5ebe5',
          200: '#c9d7c9',
          300: '#a3bba3',
          400: '#78997a',
          500: '#5A8F7B',
          600: '#456b52',
          700: '#385643',
          800: '#2f4637',
          900: '#283a2f',
        },
      },
      fontFamily: {
        heading: ['Nunito', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

