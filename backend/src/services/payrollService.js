const payrollRepository = require("../repositories/payrollRepository");

async function getBangCong({ thang, nam, ma_nhan_vien }) {
  const ky = await payrollRepository.ensureKyLuong({ thang, nam });

  if (ky.trang_thai === "chua_chot") {
    await payrollRepository.recalculateBangCong({ ky_luong_id: ky.id, thang, nam });
  }

  const summary = await payrollRepository.getBangCongSummary({ ky_luong_id: ky.id, ma_nhan_vien });
  return { ky, ...summary };
}

async function getBangCongChiTiet({ thang, nam, ma_nhan_vien }) {
  const ky = await payrollRepository.ensureKyLuong({ thang, nam });
  if (ky.trang_thai === "chua_chot") {
    await payrollRepository.recalculateBangCong({ ky_luong_id: ky.id, thang, nam });
  }

  const rows = await payrollRepository.getBangCongChiTiet({ ky_luong_id: ky.id, ma_nhan_vien });
  return { ky, ma_nhan_vien, rows };
}

async function getBangLuong({ thang, nam, ma_nhan_vien }) {
  const ky = await payrollRepository.ensureKyLuong({ thang, nam });

  if (ky.trang_thai === "chua_chot") {
    // Bảng công là nguồn để tính lương
    await payrollRepository.recalculateBangCong({ ky_luong_id: ky.id, thang, nam });
    await payrollRepository.recalculateBangLuong({ ky_luong_id: ky.id });
  }

  const result = await payrollRepository.getBangLuongSummary({ ky_luong_id: ky.id, ma_nhan_vien });
  return { ky, ...result };
}

async function updateBangLuongEmployee({ thang, nam, ma_nhan_vien, phu_cap, thuong, khau_tru, tam_ung }) {
  const ky = await payrollRepository.ensureKyLuong({ thang, nam });
  if (ky.trang_thai !== "chua_chot") {
    throw { status: 400, message: "Kỳ lương đã chốt. Chỉ có thể sửa khi mở chốt." };
  }

  // Đảm bảo base salary đã được tính theo lịch phân công mới nhất
  await payrollRepository.recalculateBangCong({ ky_luong_id: ky.id, thang, nam });
  await payrollRepository.recalculateBangLuong({ ky_luong_id: ky.id });

  await payrollRepository.updateBangLuongEmployee({
    ky_luong_id: ky.id,
    ma_nhan_vien,
    phu_cap,
    thuong,
    khau_tru,
    tam_ung,
  });

  // Trả lại dữ liệu row sau update
  const result = await payrollRepository.getBangLuongRow({ ky_luong_id: ky.id, ma_nhan_vien });
  return { ky, row: result };
}

async function lockKyLuong({ thang, nam }) {
  const ky = await payrollRepository.ensureKyLuong({ thang, nam });
  if (ky.trang_thai !== "chua_chot") {
    throw { status: 400, message: "Kỳ lương không ở trạng thái Chưa chốt." };
  }

  await payrollRepository.lockKyLuong({ ky_id: ky.id });
}

async function unlockKyLuong({ thang, nam }) {
  const ky = await payrollRepository.ensureKyLuong({ thang, nam });
  if (ky.trang_thai === "chua_chot") {
    throw { status: 400, message: "Kỳ lương đang ở trạng thái Chưa chốt." };
  }
  await payrollRepository.unlockKyLuong({ ky_id: ky.id });
}

async function markKyLuongPaid({ thang, nam }) {
  const ky = await payrollRepository.ensureKyLuong({ thang, nam });
  if (ky.trang_thai !== "da_chot") {
    throw { status: 400, message: "Chỉ đánh dấu thanh toán khi kỳ đã chốt." };
  }
  await payrollRepository.markKyLuongPaid({ ky_id: ky.id });
}

// Mật khẩu xác nhận cho thao tác hoàn tác thanh toán (yêu cầu nghiệp vụ: xác nhận trước khi đảo trạng thái đã thanh toán)
const MAT_KHAU_HOAN_TAC = "123456";

async function revertKyLuongPaid({ thang, nam, mat_khau }) {
  if (mat_khau !== MAT_KHAU_HOAN_TAC) {
    throw { status: 403, message: "Mật khẩu admin không đúng." };
  }

  const ky = await payrollRepository.ensureKyLuong({ thang, nam });
  if (ky.trang_thai !== "da_thanh_toan") {
    throw { status: 400, message: "Kỳ lương chưa ở trạng thái Đã thanh toán." };
  }
  await payrollRepository.revertKyLuongPaid({ ky_id: ky.id });
}

async function getLuongNhanVien() {
  return payrollRepository.getLuongNhanVien();
}

async function upsertLuongNhanVienBulk({ items }) {
  if (!items || items.length === 0) {
    return { message: "Không có dữ liệu cập nhật" };
  }
  return payrollRepository.upsertLuongNhanVienBulk({ items });
}

// ===== Ngày lễ / hệ số lương =====
async function getNgayLe() {
  return payrollRepository.getNgayLe();
}

async function upsertNgayLe({ ngay, ten, he_so }) {
  if (!ngay || !/^\d{4}-\d{2}-\d{2}$/.test(String(ngay))) {
    throw { status: 400, message: "Ngày không hợp lệ (yyyy-MM-dd)" };
  }
  const heSo = Number(he_so);
  if (!Number.isFinite(heSo) || heSo <= 0) {
    throw { status: 400, message: "Hệ số phải là số lớn hơn 0" };
  }
  return payrollRepository.upsertNgayLe({
    ngay,
    ten: ten ? String(ten).trim() : null,
    he_so: heSo,
  });
}

async function deleteNgayLe({ ngay }) {
  if (!ngay || !/^\d{4}-\d{2}-\d{2}$/.test(String(ngay))) {
    throw { status: 400, message: "Ngày không hợp lệ" };
  }
  const ok = await payrollRepository.deleteNgayLe({ ngay });
  if (!ok) throw { status: 404, message: "Không tìm thấy ngày lễ" };
}

module.exports = {
  getBangCong,
  getBangCongChiTiet,
  getBangLuong,
  updateBangLuongEmployee,
  lockKyLuong,
  unlockKyLuong,
  markKyLuongPaid,
  revertKyLuongPaid,
  getLuongNhanVien,
  upsertLuongNhanVienBulk,
  getNgayLe,
  upsertNgayLe,
  deleteNgayLe,
};

