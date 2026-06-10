/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pm: {
          bg: '#212121',
          panel: '#1a1a1a',
          sidebar: '#262626',
          header: '#303030',
          surface: '#2b2b2b',
          hover: '#333333',
          border: '#3b3b3b',
          muted: '#a6a6a6',
          text: '#e6e6e6',
          orange: '#ff6c37',
          'orange-hover': '#ff8255',
        },
        method: {
          get: '#61affe',
          post: '#49cc90',
          put: '#fca130',
          patch: '#50e3c2',
          delete: '#f93e3e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
