const nhanVienRepository = require("../repositories/nhanVienRepository");

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
  if (trang_thai === undefined) {
    throw { status: 400, message: "Thiếu trạng thái (0 hoặc 1)" };
  }
  return await nhanVienRepository.updateStatus(id, trang_thai);
};

const createAssignment = async (payload) => {
  const { ma_nhan_vien, ma_ca, ngay } = payload;
  if (!ma_nhan_vien || !ma_ca || !ngay) {
    throw { status: 400, message: "Vui lòng chọn đủ nhân viên, ca làm và ngày" };
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