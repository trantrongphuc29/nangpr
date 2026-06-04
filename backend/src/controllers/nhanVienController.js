const nhanVienService = require("../services/nhanVienService");

const getList = async (req, res) => {
  try {
    const results = await nhanVienService.getList();
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi tải danh sách nhân viên", error: err.message });
  }
};

const getAssignments = async (req, res) => {
  try {
    const results = await nhanVienService.getAssignments(req.query);
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi tải phân công", error: err.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const result = await nhanVienService.createStaff(req.body);
    return res.json({ message: "Thêm thành công", id: result.insertId });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

const toggleStatus = async (req, res) => {
  try {
    await nhanVienService.toggleStatus(req.params.id, req.body);
    const list = await nhanVienService.getList();
    const staff = list.find((s) => String(s.ma_nhan_vien) === String(req.params.id));
    return res.json({
      message: "Cập nhật trạng thái thành công",
      nhan_vien: staff || null,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    await nhanVienService.createAssignment(req.body);
    return res.json({ message: "Phân công thành công!" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Nhân viên đã được phân công vào ca này!" });
    }
    return res.status(err.status || 500).json({ message: err.message });
  }
};

const removeAssignment = async (req, res) => {
  try {
    await nhanVienService.removeAssignment(req.body);
    return res.json({ message: "Đã xóa phân công" });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    await nhanVienService.updateStaff(req.params.id, req.body);
    return res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi cập nhật nhân viên", error: err.message });
  }
};

const removeStaff = async (req, res) => {
  try {
    await nhanVienService.removeStaff(req.params.id);
    return res.json({ message: "Đã xóa" });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi xóa nhân viên", error: err.message });
  }
};

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