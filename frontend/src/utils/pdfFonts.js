function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

const fontCache = {
  regular: null,
  bold: null,
};

async function loadFontBase64(path) {
  const base = process.env.PUBLIC_URL || "";
  const url = `${base}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Không tải được font: ${path}`);
  }
  return arrayBufferToBase64(await res.arrayBuffer());
}

/**
 * Đăng ký Roboto (hỗ trợ tiếng Việt) cho jsPDF — gọi một lần trước khi vẽ text.
 */
export async function registerPdfFonts(doc) {
  if (!fontCache.regular) {
    [fontCache.regular, fontCache.bold] = await Promise.all([
      loadFontBase64("/fonts/Roboto-Regular.ttf"),
      loadFontBase64("/fonts/Roboto-Bold.ttf"),
    ]);
  }

  doc.addFileToVFS("Roboto-Regular.ttf", fontCache.regular);
  doc.addFileToVFS("Roboto-Bold.ttf", fontCache.bold);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
}

export const PDF_FONT = "Roboto";
