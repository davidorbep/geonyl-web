/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        brand: {
          turquoise: '#00D2C4',
          turquoiseDark: '#009D93',
          turquoiseLight: '#E6FFFD',
          blue: '#0284C7',
          blueDark: '#0369A1',
          navy: '#0F172A',
          slateNavy: '#1E293B'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif']
      }
    }
  },
  plugins: []
};
