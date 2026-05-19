module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "surface-container-low": "var(--color-main-bg)",
        "on-surface": "var(--color-text)",
        outline: "var(--color-border)",
      }
    }
  },
  plugins: []
};