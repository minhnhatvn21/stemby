import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        energy: {
          sky: '#38BDF8',
          leaf: '#4ADE80',
          sun: '#FACC15',
          ocean: '#0EA5E9'
        }
      },
      boxShadow: {
        glow: '0 0 0 3px rgba(56, 189, 248, 0.3)'
      }
    }
  },
  plugins: []
};

export default config;
