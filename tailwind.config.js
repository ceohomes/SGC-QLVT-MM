/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        royal: {
          50:  '#eef4fd',
          100: '#d5e5fb',
          200: '#aecbf7',
          300: '#7aaaf1',
          400: '#5490eb',
          500: '#3b7fe8',
          600: '#2563d4',
          700: '#1d4fb8',
          800: '#1a3f96',
          900: '#1a3478',
          950: '#111f4a',
        },
      },
    },
  },
  plugins: [],
}
