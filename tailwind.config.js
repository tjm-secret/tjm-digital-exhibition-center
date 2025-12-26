/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#CFB53B',
          light: '#E5C565',
          dark: '#B49B2F',
        },
        dark: {
          bg: '#1a1a1a',
          surface: '#252525',
          overlay: 'rgba(26, 26, 26, 0.8)',
        }
      },
      fontFamily: {
        serif: ['"Shippori Mincho"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
      },
      screens: {
        'sm': '640px',
        'md': '768px', 
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}