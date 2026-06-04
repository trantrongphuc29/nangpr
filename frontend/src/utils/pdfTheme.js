function hexToRgb(hex) {
  const h = (hex || "").replace("#", "").trim();
  if (h.length !== 6) return [31, 41, 55];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Lấy màu PDF từ CSS variables của app (theo theme hiện tại). */
export function getPdfTheme() {
  if (typeof document === "undefined") {
    return {
      primary: [47, 93, 80],
      onPrimary: [255, 255, 255],
      primaryContainer: [232, 239, 233],
      text: [31, 41, 55],
      muted: [107, 114, 128],
      border: [229, 231, 235],
      surface: [255, 255, 255],
      mainBg: [247, 243, 232],
    };
  }

  const root = getComputedStyle(document.documentElement);
  const v = (name) => root.getPropertyValue(name).trim();

  return {
    primary: hexToRgb(v("--color-primary")),
    onPrimary: hexToRgb(v("--color-on-primary") || "#FFFFFF"),
    primaryContainer: hexToRgb(v("--color-primary-container")),
    text: hexToRgb(v("--color-text")),
    muted: hexToRgb(v("--color-muted")),
    border: hexToRgb(v("--color-border")),
    surface: hexToRgb(v("--color-card-bg") || "#FFFFFF"),
    mainBg: hexToRgb(v("--color-main-bg")),
  };
}
