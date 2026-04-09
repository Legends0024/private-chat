/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        galaxy: {
          dark: '#020205',      // Even deeper black for contrast
          surface: '#0f0f1d',   // Slightly lighter surface
          accent: '#6366f1',    // Indigo
          vivid: '#a855f7',     // Purple
          text: '#f8fafc'       // Ultra-bright text for visibility
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
      }
    },
  },
  plugins: [],
}
