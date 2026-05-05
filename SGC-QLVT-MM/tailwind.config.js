/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e4f0',
          200: '#b3c9e1',
          300: '#7da5c8',
          400: '#4a7fad',
          500: '#1e5f8e',
          600: '#1a4f7a',
          700: '#163f63',
          800: '#0f2d4a',
          900: '#091e32',
          950: '#050f1a',
        },
      },
    },
  },
  plugins: [],
}
