/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#030305',
          panel: '#090a0f',
          card: '#0f111a',
          border: '#1e2235',
          neonGreen: '#00ff66',
          neonRed: '#ff0055',
          neonPurple: '#a855f7',
          neonCyan: '#00f0ff',
          neonYellow: '#ffe600'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(255, 0, 85, 0.4)',
        'glow-green': '0 0 20px rgba(0, 255, 102, 0.3)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.3)',
      }
    },
  },
  plugins: [],
}