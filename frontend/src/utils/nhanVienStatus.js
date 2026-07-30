export const TRANG_THAI_LABELS = {
  dang_lam: "Đang làm",
  tam_nghi: "Tạm nghỉ",
  da_nghi: "Đã nghỉ",
};

export function normalizeTrangThai(value) {
  if (value === 1 || value === "1") return "dang_lam";
  if (value === 0 || value === "0") return "da_nghi";
  if (value === "dang_lam" || value === "tam_nghi" || value === "da_nghi") return value;
  return "dang_lam";
}

export function isDangLam(value) {
  return normalizeTrangThai(value) === "dang_lam";
}

/**
 * Không còn "ẩn mềm" ca của nhân viên đã nghỉ: khi chuyển sang tạm nghỉ / đã nghỉ,
 * backend xoá hẳn các ca từ hôm nay trở đi. Lịch hiển thị đúng những gì còn trong DB,
 * cũng là đúng những gì sẽ được tính công.
 */
export function canAssignOnDay(trangThai, dayStr, todayStr) {
  return isDangLam(trangThai) && dayStr >= todayStr;
}

/** Danh sách NV trong modal gán ca: quá khứ cho phép mọi NV, từ hôm nay chỉ đang làm */
export function canSelectInAssignModal(trangThai, dayStr, todayStr) {
  const ngay = String(dayStr || "").substring(0, 10);
  if (ngay && ngay < todayStr) return true;
  return canAssignOnDay(trangThai, ngay || todayStr, todayStr);
}
