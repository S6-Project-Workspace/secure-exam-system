/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#A42EFF",
        "primary-dark": "#3E016C",
        "secondary": "#111827",
        "background-light": "#eef0f2",
        "background-dark": "#1a1a1a",
        "surface-dark": "#1e1e1e",
        "surface-dark-hover": "#2a2a2a",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
};
