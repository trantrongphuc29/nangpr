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

// ===== Khoản điều chỉnh (thưởng / khấu trừ / tạm ứng) =====
const LOAI_DIEU_CHINH = ["thuong", "khau_tru", "tam_ung"];
const SO_TIEN_TOI_DA = 100000000;

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Sau mỗi thay đổi: tính lại tổng 3 cột từ các dòng chi tiết rồi trả row mới,
// để FE cập nhật đúng một dòng thay vì tải lại cả bảng.
async function refreshRowSauDieuChinh({ ky, thang, nam, ma_nhan_vien, loai }) {
  await payrollRepository.recalculateBangCong({ ky_luong_id: ky.id, thang, nam });
  await payrollRepository.recalculateBangLuong({ ky_luong_id: ky.id });

  const [row, items] = await Promise.all([
    payrollRepository.getBangLuongRow({ ky_luong_id: ky.id, ma_nhan_vien }),
    payrollRepository.getDieuChinh({ ky_luong_id: ky.id, ma_nhan_vien, loai }),
  ]);
  return { ky, row, items };
}

async function getDieuChinh({ thang, nam, ma_nhan_vien, loai }) {
  if (!LOAI_DIEU_CHINH.includes(loai)) {
    throw { status: 400, message: "Loại khoản điều chỉnh không hợp lệ" };
  }
  const ky = await payrollRepository.ensureKyLuong({ thang, nam });
  const items = await payrollRepository.getDieuChinh({ ky_luong_id: ky.id, ma_nhan_vien, loai });
  return { ky, ma_nhan_vien, loai, items };
}

async function addDieuChinh({ thang, nam, ma_nhan_vien, loai, so_tien, ly_do, ngay }) {
  if (!LOAI_DIEU_CHINH.includes(loai)) {
    throw { status: 400, message: "Loại khoản điều chỉnh không hợp lệ" };
  }

  const soTien = Math.round(Number(so_tien));
  if (!Number.isFinite(soTien) || soTien <= 0) {
    throw { status: 400, message: "Số tiền phải lớn hơn 0" };
  }
  if (soTien > SO_TIEN_TOI_DA) {
    throw { status: 400, message: `Số tiền không được vượt quá ${SO_TIEN_TOI_DA.toLocaleString("vi-VN")}đ` };
  }

  const ky = await payrollRepository.ensureKyLuong({ thang, nam });
  if (ky.trang_thai !== "chua_chot") {
    throw { status: 400, message: "Kỳ lương đã chốt. Chỉ có thể sửa khi mở chốt." };
  }

  // Ngày phải thuộc đúng tháng/năm của kỳ, tránh khoản của tháng này lọt sang tháng khác
  const ngayStr = ngay || null;
  if (ngayStr && !/^\d{4}-\d{2}-\d{2}$/.test(String(ngayStr))) {
    throw { status: 400, message: "Ngày không hợp lệ (yyyy-MM-dd)" };
  }
  const soNgayTrongThang = new Date(nam, thang, 0).getDate();
  const ngayFinal = ngayStr || `${nam}-${pad2(thang)}-${pad2(Math.min(new Date().getDate(), soNgayTrongThang))}`;
  if (!ngayFinal.startsWith(`${nam}-${pad2(thang)}-`)) {
    throw { status: 400, message: `Ngày phải nằm trong tháng ${pad2(thang)}/${nam}` };
  }

  const lyDo = ly_do ? String(ly_do).trim().slice(0, 255) : null;

  await payrollRepository.addDieuChinh({
    ky_luong_id: ky.id,
    ma_nhan_vien,
    loai,
    so_tien: soTien,
    ly_do: lyDo || null,
    ngay: ngayFinal,
  });

  return refreshRowSauDieuChinh({ ky, thang, nam, ma_nhan_vien, loai });
}

async function deleteDieuChinh({ thang, nam, id }) {
  const ky = await payrollRepository.ensureKyLuong({ thang, nam });
  if (ky.trang_thai !== "chua_chot") {
    throw { status: 400, message: "Kỳ lương đã chốt. Chỉ có thể sửa khi mở chốt." };
  }

  const item = await payrollRepository.getDieuChinhById({ id });
  if (!item) {
    throw { status: 404, message: "Không tìm thấy khoản điều chỉnh" };
  }
  // Chặn xóa nhầm dòng của kỳ khác qua id tự chế
  if (Number(item.ky_luong_id) !== Number(ky.id)) {
    throw { status: 400, message: "Khoản điều chỉnh không thuộc kỳ lương này" };
  }

  await payrollRepository.deleteDieuChinh({ id });

  return refreshRowSauDieuChinh({
    ky,
    thang,
    nam,
    ma_nhan_vien: item.ma_nhan_vien,
    loai: item.loai,
  });
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
  getDieuChinh,
  addDieuChinh,
  deleteDieuChinh,
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

