const nhanVienRepository = require("../repositories/nhanVienRepository");

const getList = (callback) => nhanVienRepository.getAll(callback);

const getAssignments = (queryOptions, callback) =>
  nhanVienRepository.getAssignments(queryOptions, callback);

const createStaff = (payload, callback) => {
  const { ten, so_dien_thoai } = payload;
  if (!ten || !so_dien_thoai) {
    return callback({ status: 400, body: { message: "Thiếu dữ liệu" } });
  }
  return nhanVienRepository.createStaff(payload, callback);
};

const createAssignment = (payload, callback) => {
  const { ma_nhan_vien, ma_ca, ngay } = payload;
  if (!ma_nhan_vien || !ma_ca || !ngay) {
    return callback({
      status: 400,
      body: { message: "Vui lòng chọn đủ nhân viên, ca làm và ngày" },
    });
  }
  return nhanVienRepository.createAssignment(payload, callback);
};

const removeAssignment = (payload, callback) => {
  const { ma_nhan_vien, ma_ca, ngay } = payload;
  if (!ma_nhan_vien || !ma_ca || !ngay) {
    return callback({ status: 400, body: { message: "Thiếu dữ liệu xóa" } });
  }
  return nhanVienRepository.removeAssignment(payload, callback);
};

const updateStaff = (id, payload, callback) => nhanVienRepository.updateStaff(id, payload, callback);

const removeStaff = (id, callback) => nhanVienRepository.removeStaff(id, callback);

module.exports = {
  getList,
  getAssignments,
  createStaff,
  createAssignment,
  removeAssignment,
  updateStaff,
  removeStaff,
};
