const TRANG_THAI_VALUES = ["dang_lam", "tam_nghi", "da_nghi"];

function normalizeTrangThai(value) {
  if (value === 1 || value === "1") return "dang_lam";
  if (value === 0 || value === "0") return "da_nghi";
  if (TRANG_THAI_VALUES.includes(value)) return value;
  return "dang_lam";
}

function isValidTrangThai(value) {
  return (
    value === 1 ||
    value === "1" ||
    value === 0 ||
    value === "0" ||
    TRANG_THAI_VALUES.includes(value)
  );
}

module.exports = { TRANG_THAI_VALUES, normalizeTrangThai, isValidTrangThai };
