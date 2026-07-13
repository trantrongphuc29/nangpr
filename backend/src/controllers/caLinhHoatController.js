const caLinhHoatService = require("../services/caLinhHoatService");

const getAssignments = async (req, res) => {
  try {
    const results = await caLinhHoatService.getAssignments(req.query);
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi tải phân công linh hoạt", error: err.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    await caLinhHoatService.createAssignment(req.body);
    return res.json({ message: "Phân công ca linh hoạt thành công!" });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    await caLinhHoatService.updateAssignment(req.params.id, req.body);
    return res.json({ message: "Đã cập nhật ca linh hoạt" });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

const removeAssignment = async (req, res) => {
  try {
    await caLinhHoatService.removeAssignment(req.params.id);
    return res.json({ message: "Đã xóa ca linh hoạt" });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  removeAssignment,
};
