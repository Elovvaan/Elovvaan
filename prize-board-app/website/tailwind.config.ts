import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#dcecff',
          200: '#bfdfff',
          300: '#94c9ff',
          400: '#62adff',
          500: '#3f90ff',
          600: '#2b74f5',
          700: '#225de1',
          800: '#234cb6',
          900: '#22438f'
        },
        silver: '#c7ced9'
      },
      boxShadow: {
        glow: '0 10px 35px rgba(63, 144, 255, 0.25)'
      }
    }
  },
  plugins: []
};

export default config;
