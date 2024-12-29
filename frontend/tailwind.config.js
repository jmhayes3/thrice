/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00ff88",
        secondary: "#00ccff",
        "bg-dark": "#1a1a2e",
        "bg-light": "#16213e",
        amber: "#ffc107",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}

