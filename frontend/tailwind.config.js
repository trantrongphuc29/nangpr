module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-soft": "var(--color-primary-soft)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        muted: "var(--color-muted)",
        card: "var(--color-card-bg)",
        outline: "var(--color-border)",
        "outline-subtle": "var(--color-border-subtle)",
        "surface-container-low": "var(--color-main-bg)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "surface-container-high": "var(--color-surface-container-high)",
        "on-surface": "var(--color-text)",
        "on-surface-secondary": "var(--color-text-secondary)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "primary-container": "var(--color-primary-container)",
        "on-primary": "var(--color-on-primary)",
        "tertiary-container": "var(--color-tertiary-container)",
        "on-tertiary-container": "var(--color-on-tertiary-container)",
        error: "var(--color-error)",
        "error-container": "var(--color-error-container)",
        "on-error": "var(--color-on-error)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    }
  },
  plugins: []
};
