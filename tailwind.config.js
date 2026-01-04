/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Cores principais do Mimoo
        coral: {
          50: '#fff5f3',
          100: '#ffe8e3',
          200: '#ffd5cc',
          300: '#ffb8a8',
          400: '#ff9076',
          500: '#FF7F6B',
          600: '#f85a3a',
          DEFAULT: '#FF7F6B'
        },
        sage: {
          50: '#f6f8f6',
          100: '#e9f0ea',
          200: '#d5e3d7',
          300: '#b4cdb8',
          400: '#8db094',
          500: '#6d9576',
          600: '#567a5e',
          DEFAULT: '#8db094'
        },
        cream: {
          DEFAULT: '#faf8f5',
          dark: '#f5f2ed'
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        green: {
          500: '#22c55e',
        },
        red: {
          200: '#fecaca',
          600: '#dc2626',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
