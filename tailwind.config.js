/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas-bg)',
        panel: {
          DEFAULT: 'var(--panel-bg)',
          glass: 'var(--panel-glass)',
          border: 'var(--panel-border)',
        },
        paper: {
          DEFAULT: 'var(--paper-bg)',
          sub: 'var(--paper-sub)',
          ink: 'var(--paper-ink)',
          muted: 'var(--paper-muted)',
          border: 'var(--paper-border)',
        },
        status: {
          proven: {
            DEFAULT: 'var(--proven-ink)',
            glow: 'var(--proven-glow)',
            wash: 'var(--proven-wash)',
          },
          basic: {
            DEFAULT: 'var(--basic-ink)',
            glow: 'var(--basic-glow)',
            wash: 'var(--basic-wash)',
          },
          notshown: {
            DEFAULT: 'var(--notshown-ink)',
            glow: 'var(--notshown-glow)',
            wash: 'var(--notshown-wash)',
          },
          unclear: {
            DEFAULT: 'var(--unclear-ink)',
            glow: 'var(--unclear-glow)',
            wash: 'var(--unclear-wash)',
          },
          attack: {
            DEFAULT: 'var(--attack-ink)',
            glow: 'var(--attack-glow)',
            wash: 'var(--attack-wash)',
          },
        },
      },
      fontFamily: {
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        editorial: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      borderRadius: {
        receipt: '6px',
        panel: '20px',
        stamp: '3px',
      },
      boxShadow: {
        paper: '0 35px 70px -15px rgba(0, 0, 0, 0.65), 0 15px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        glass: '0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        'proven-glow': '0 0 16px rgba(52, 211, 153, 0.35)',
        'basic-glow': '0 0 14px rgba(245, 165, 36, 0.35)',
        'notshown-glow': '0 0 12px rgba(124, 140, 168, 0.25)',
        'unclear-glow': '0 0 14px rgba(139, 124, 255, 0.35)',
        'attack-glow': '0 0 16px rgba(255, 92, 77, 0.45)',
      },
    },
  },
  plugins: [],
};
