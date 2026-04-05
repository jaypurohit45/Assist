/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f0f0f',
          card: '#1a1a1a',
          input: '#2e2e2e',
          hover: '#252525',
          border: '#2a2a2a',
        },
        accent: {
          DEFAULT: '#10a37f',
          hover: '#0d8a6a',
          dim: '#0d8a6a33',
          glow: '#10a37f22',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '40%': { transform: 'translateY(-6px)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease forwards',
        'dot-1': 'dot-bounce 1.2s ease-in-out infinite 0s',
        'dot-2': 'dot-bounce 1.2s ease-in-out infinite 0.2s',
        'dot-3': 'dot-bounce 1.2s ease-in-out infinite 0.4s',
      },
    },
  },
  plugins: [],
}
