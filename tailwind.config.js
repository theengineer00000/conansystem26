/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
    "./resources/**/*.ts",
    "./resources/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          50:  '#f0f9ff',  // blue-50
          100: '#e0f2fe',  // blue-100
          200: '#bae6fd',  // blue-200
          300: '#7dd3fc',  // blue-300
          400: '#38bdf8',  // blue-400
          500: '#0ea5e9',  // blue-500
          600: '#0284c7',  // blue-600
          700: '#0369a1',  // blue-700
          800: '#075985',  // blue-800
          900: '#0c4a6e',  // blue-900
        }
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
