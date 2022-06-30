/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,jsx}', './index.html'],
  theme: {
    extend: {}
  },
  plugins: [
    require('daisyui')
  ]
}
