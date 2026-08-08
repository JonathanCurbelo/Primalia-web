/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF8F6',
        card: '#FFFFFF',
        cardElevated: '#F8F6F3',
        accent: '#FF7A27',
        accentDark: '#EA5C17',
        accentSoft: '#FFEEDD',
        accentMid: '#FFD9B8',
        secondary: '#34A353',
        secondarySoft: '#E6F6E9',
        amber: '#D89214',
        danger: '#D94438',
        textPrimary: '#252120',
        textSecondary: '#716A62',
        textTertiary: '#A39D97',
        cardBorder: '#ECE7E4'
      },
      boxShadow: {
        card: '0 6px 14px rgba(0,0,0,0.06)'
      },
      borderRadius: {
        xl2: '20px',
        xl3: '26px'
      }
    }
  },
  plugins: []
}
