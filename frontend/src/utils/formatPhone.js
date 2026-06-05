/** Hiển thị SĐT dễ đọc — không đổi giá trị lưu trong DB */
export function formatPhoneDisplay(phone) {
  if (phone == null || String(phone).trim() === "") return "—";

  const raw = String(phone).trim();
  const digits = raw.replace(/\D/g, "");
  if (!digits) return raw;

  if (digits.length === 10 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  if (digits.length === 11 && digits.startsWith("84")) {
    const local = `0${digits.slice(2)}`;
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }

  return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}
