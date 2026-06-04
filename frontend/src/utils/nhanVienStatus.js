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

export function isPastDate(dayStr, todayStr) {
  const ngay = String(dayStr || "").substring(0, 10);
  const homNay = String(todayStr || "").substring(0, 10);
  return Boolean(ngay && homNay && ngay < homNay);
}

/** Ngày quá khứ hoặc hôm nay */
export function isTodayOrPast(dayStr, todayStr) {
  const ngay = String(dayStr || "").substring(0, 10);
  const homNay = String(todayStr || "").substring(0, 10);
  return Boolean(ngay && homNay && ngay <= homNay);
}

/**
 * Hiển thị ca đã phân công trên lịch tuần.
 * - Quá khứ & hôm nay: luôn giữ khi đổi trạng thái.
 * - Tương lai: ẩn nếu tạm nghỉ / đã nghỉ.
 */
export function shouldShowAssignmentOnSchedule({ assignmentDate, cellDate, today, currentStatus }) {
  const ngayCa = String(assignmentDate || cellDate || "").substring(0, 10);
  const homNay = String(today || "").substring(0, 10);
  if (isTodayOrPast(ngayCa, homNay)) return true;

  const s = normalizeTrangThai(currentStatus);
  if (s === "dang_lam") return true;
  return false;
}

/** @deprecated dùng shouldShowAssignmentOnSchedule */
export function showOnScheduleDay(trangThai, dayStr, todayStr) {
  return shouldShowAssignmentOnSchedule({
    assignmentDate: dayStr,
    cellDate: dayStr,
    today: todayStr,
    currentStatus: trangThai,
  });
}

export function canAssignOnDay(trangThai, dayStr, todayStr) {
  return isDangLam(trangThai) && dayStr >= todayStr;
}

/** Danh sách NV trong modal gán ca: quá khứ cho phép mọi NV, từ hôm nay chỉ đang làm */
export function canSelectInAssignModal(trangThai, dayStr, todayStr) {
  const ngay = String(dayStr || "").substring(0, 10);
  if (ngay && ngay < todayStr) return true;
  return canAssignOnDay(trangThai, ngay || todayStr, todayStr);
}
