/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand palette ────────────────────────────────────────────
        terracota: {
          light:   '#E8896A',
          DEFAULT: '#C4622D',
          dark:    '#8B3D18',
        },
        floresta: {
          light:   '#5A9468',
          DEFAULT: '#3A6B47',
          dark:    '#254732',
        },
        ouro: {
          light:   '#F0C84A',
          DEFAULT: '#D4A020',
          dark:    '#9A7010',
        },
        creme:     '#FAF6F0',
        quentinho: '#F5EDE0',
        cafe: {
          light:   '#8B6555',
          DEFAULT: '#5C3D2E',
          muted:   '#7A5C4A',
          subtle:  '#B89080',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['Lato', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        brand: '20px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(44,26,14,0.08)',
        lift: '0 4px 20px rgba(44,26,14,0.12)',
      },
      keyframes: {
        'fade-in':    { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'scale-in':   { from: { opacity: '0', transform: 'scale(0.96)' },    to: { opacity: '1', transform: 'scale(1)' } },
        'toast-in':   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in':  'fade-in 0.25s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
        'toast-in': 'toast-in 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}
