const nhanVienRepository = require("../repositories/nhanVienRepository");
const { isValidTrangThai, normalizeTrangThai } = require("../utils/nhanVienStatus");

/** Ngày hôm nay theo giờ Việt Nam (UTC+7), bất kể timezone của server */
function ngayHomNayVN() {
  return new Date(Date.now() + 7 * 3600000).toISOString().substring(0, 10);
}

const TRANG_THAI_KY_LUONG_LABEL = {
  da_chot: "đã chốt",
  da_thanh_toan: "đã thanh toán",
};

/**
 * Chặn mọi thay đổi phân công thuộc tháng đã chốt lương.
 * Giữ `phancong` luôn khớp với bảng công đã chốt.
 */
async function assertKyLuongChuaChot(ngayStr) {
  const trangThai = await nhanVienRepository.getTrangThaiKyLuongTheoNgay(ngayStr);
  if (trangThai === "chua_chot") return;

  const [nam, thang] = ngayStr.split("-");
  throw {
    status: 400,
    message: `Kỳ lương tháng ${Number(thang)}/${nam} ${
      TRANG_THAI_KY_LUONG_LABEL[trangThai] || "đã khoá"
    }. Muốn sửa lịch phân công, hãy mở chốt kỳ lương trước.`,
  };
}

const getList = async () => await nhanVienRepository.getAll();

const getKyLuongDaChot = async () => await nhanVienRepository.getKyLuongDaChot();

const getShifts = async () => await nhanVienRepository.getShifts();

const getAssignments = async (queryOptions) => await nhanVienRepository.getAssignments(queryOptions);

const createStaff = async (payload) => {
  const { ten, so_dien_thoai } = payload;
  if (!ten || !so_dien_thoai) {
    throw { status: 400, message: "Thiếu dữ liệu" };
  }
  return await nhanVienRepository.createStaff(payload);
};

const toggleStatus = async (id, payload) => {
  const { trang_thai } = payload;
  if (trang_thai === undefined || !isValidTrangThai(trang_thai)) {
    throw { status: 400, message: "Trạng thái không hợp lệ (dang_lam, tam_nghi, da_nghi)" };
  }
  const trangThai = normalizeTrangThai(trang_thai);
  const ok = await nhanVienRepository.updateStatus(id, trangThai);
  if (!ok) {
    throw { status: 404, message: "Không tìm thấy nhân viên hoặc không cập nhật được trạng thái" };
  }

  // Nghỉ (tạm nghỉ / đã nghỉ) thì gỡ hẳn khỏi các ca từ hôm nay trở đi.
  // Ca quá khứ giữ nguyên vì đã làm thật và là căn cứ tính công.
  let so_ca_da_go = 0;
  if (trangThai !== "dang_lam") {
    so_ca_da_go = await nhanVienRepository.removeFutureAssignments(id, ngayHomNayVN());
  }

  return { ok, so_ca_da_go };
};

const createAssignment = async (payload) => {
  const { ma_nhan_vien, ma_ca, ngay } = payload;
  if (!ma_nhan_vien || !ma_ca || !ngay) {
    throw { status: 400, message: "Vui lòng chọn đủ nhân viên, ca làm và ngày" };
  }
  const ngayStr = String(ngay).substring(0, 10);
  await assertKyLuongChuaChot(ngayStr);

  const staffList = await nhanVienRepository.getAll();
  const staff = staffList.find((s) => String(s.ma_nhan_vien) === String(ma_nhan_vien));
  const status = normalizeTrangThai(staff?.trang_thai);
  const todayStr = ngayHomNayVN();
  if (status !== "dang_lam" && ngayStr >= todayStr) {
    throw {
      status: 400,
      message: "Chỉ nhân viên đang làm mới được phân công từ hôm nay trở đi",
    };
  }
  return await nhanVienRepository.createAssignment(payload);
};

const removeAssignment = async (payload) => {
  const { ma_nhan_vien, ma_ca, ngay } = payload;
  if (!ma_nhan_vien || !ma_ca || !ngay) {
    throw { status: 400, message: "Thiếu dữ liệu xóa" };
  }
  await assertKyLuongChuaChot(String(ngay).substring(0, 10));
  return await nhanVienRepository.removeAssignment(payload);
};

const updateStaff = async (id, payload) => await nhanVienRepository.updateStaff(id, payload);
const removeStaff = async (id) => await nhanVienRepository.removeStaff(id);

module.exports = {
  getList,
  getShifts,
  getAssignments,
  getKyLuongDaChot,
  createStaff,
  toggleStatus,
  createAssignment,
  removeAssignment,
  updateStaff,
  removeStaff,
};