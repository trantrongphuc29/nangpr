module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#553722",
        "primary-container": "#6f4e37",
        "tertiary-container": "#f3e7db",
        "on-tertiary-container": "#553722", // FIX lỗi sai chính tả ở đây
        "on-surface": "#3b2f2f",
        "on-surface-variant": "#7c6f64",
        "surface-container-low": "#f5f5f0",
        "surface-container-high": "#e8e8e3",
        outline: "#d6ccc2",
        error: "#dc2626",
        "error-container": "#fee2e2"
      }
    }
  },
  plugins: []
};