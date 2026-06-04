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

async function updateBangLuongEmployee({ thang, nam, ma_nhan_vien, phu_cap, thuong, khau_tru, tam_ung, adminId }) {
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
    adminId,
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

async function getLuongNhanVien() {
  return payrollRepository.getLuongNhanVien();
}

async function upsertLuongNhanVienBulk({ items }) {
  if (!items || items.length === 0) {
    return { message: "Không có dữ liệu cập nhật" };
  }
  return payrollRepository.upsertLuongNhanVienBulk({ items });
}

module.exports = {
  getBangCong,
  getBangCongChiTiet,
  getBangLuong,
  updateBangLuongEmployee,
  lockKyLuong,
  unlockKyLuong,
  markKyLuongPaid,
  getLuongNhanVien,
  upsertLuongNhanVienBulk,
};

