/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.08)',
        'soft-dark': '0 22px 70px rgba(0, 0, 0, 0.35)'
      },
      backgroundImage: {
        'premium-radial':
          'radial-gradient(circle at 18% 0%, rgba(56, 189, 248, 0.18), transparent 28%), radial-gradient(circle at 88% 12%, rgba(34, 197, 94, 0.13), transparent 24%)'
      }
    }
  },
  plugins: []
};
