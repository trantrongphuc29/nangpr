const nhanVienRepository = require("../repositories/nhanVienRepository");
const { isValidTrangThai, normalizeTrangThai } = require("../utils/nhanVienStatus");

const getList = async () => await nhanVienRepository.getAll();

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
  const ok = await nhanVienRepository.updateStatus(id, normalizeTrangThai(trang_thai));
  if (!ok) {
    throw { status: 404, message: "Không tìm thấy nhân viên hoặc không cập nhật được trạng thái" };
  }
  return ok;
};

const createAssignment = async (payload) => {
  const { ma_nhan_vien, ma_ca, ngay } = payload;
  if (!ma_nhan_vien || !ma_ca || !ngay) {
    throw { status: 400, message: "Vui lòng chọn đủ nhân viên, ca làm và ngày" };
  }
  const staffList = await nhanVienRepository.getAll();
  const staff = staffList.find((s) => String(s.ma_nhan_vien) === String(ma_nhan_vien));
  const status = normalizeTrangThai(staff?.trang_thai);
  const ngayStr = String(ngay).substring(0, 10);
  const d = new Date();
  // Lấy ngày Việt Nam (UTC+7) bất kể server timezone
  const todayStr = new Date(d.getTime() + 7 * 3600000).toISOString().substring(0, 10);
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
  return await nhanVienRepository.removeAssignment(payload);
};

const updateStaff = async (id, payload) => await nhanVienRepository.updateStaff(id, payload);
const removeStaff = async (id) => await nhanVienRepository.removeStaff(id);

module.exports = {
  getList,
  getAssignments,
  createStaff,
  toggleStatus,
  createAssignment,
  removeAssignment,
  updateStaff,
  removeStaff,
};