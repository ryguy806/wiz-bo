module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        growShrink: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' }, // Grows to 120% size
        },
      },
      animation: {
        'grow-shrink': 'growShrink 3s ease-in-out infinite', // 3-second infinite loop
      },
    },
  },
  plugins: [],
}