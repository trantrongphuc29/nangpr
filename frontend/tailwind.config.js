/**
 * Màu của theme nằm trong biến CSS (đổi theo sáng/tối). Nếu khai báo thẳng
 * "var(--color-x)" thì Tailwind 3 KHÔNG chèn được alpha -> các class dạng
 * `bg-primary/20`, `border-outline/40`, `text-muted/60`... không sinh ra CSS
 * và phần tử mất hẳn nền/viền.
 *
 * Trả về hàm để Tailwind tự dựng giá trị: không có modifier thì giữ nguyên
 * var() như cũ, có modifier thì dùng color-mix (đã dùng sẵn nhiều nơi trong dự án).
 */
const themeColor = (bien) => ({ opacityValue } = {}) => {
  // Utility gốc (bg-primary): Tailwind truyền var(--tw-bg-opacity) hoặc undefined
  if (opacityValue === undefined || String(opacityValue).includes("var(")) {
    return `var(${bien})`;
  }
  return `color-mix(in srgb, var(${bien}) ${Number(opacityValue) * 100}%, transparent)`;
};

module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: themeColor("--color-primary"),
        "primary-soft": themeColor("--color-primary-soft"),
        secondary: themeColor("--color-secondary"),
        accent: themeColor("--color-accent"),
        muted: themeColor("--color-muted"),
        card: themeColor("--color-card-bg"),
        outline: themeColor("--color-border"),
        "outline-subtle": themeColor("--color-border-subtle"),
        "surface-container-low": themeColor("--color-main-bg"),
        "surface-container-lowest": themeColor("--color-surface-container-lowest"),
        "surface-container-high": themeColor("--color-surface-container-high"),
        "on-surface": themeColor("--color-text"),
        "on-surface-secondary": themeColor("--color-text-secondary"),
        "on-surface-variant": themeColor("--color-on-surface-variant"),
        "primary-container": themeColor("--color-primary-container"),
        "on-primary": themeColor("--color-on-primary"),
        "tertiary-container": themeColor("--color-tertiary-container"),
        "on-tertiary-container": themeColor("--color-on-tertiary-container"),
        error: themeColor("--color-error"),
        "error-container": themeColor("--color-error-container"),
        "on-error": themeColor("--color-on-error"),
        success: themeColor("--color-success"),
        warning: themeColor("--color-warning"),
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
