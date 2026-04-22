const nhanVienService = require("../services/nhanVienService");

const getList = (req, res) => {
  nhanVienService.getList((err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
};

const getAssignments = (req, res) => {
  nhanVienService.getAssignments(req.query, (err, results) => {
    if (err) return res.status(500).json(err);
    return res.json(results);
  });
};

const createStaff = (req, res) => {
  nhanVienService.createStaff(req.body, (err, result) => {
    if (err?.status) return res.status(err.status).json(err.body);
    if (err) return res.status(500).json({ message: err.sqlMessage });
    return res.json({ message: "Thêm thành công", id: result.insertId });
  });
};

const createAssignment = (req, res) => {
  nhanVienService.createAssignment(req.body, (err) => {
    if (err?.status) return res.status(err.status).json(err.body);
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Nhân viên đã được phân công vào ca này!" });
      }
      return res.status(500).json({ message: err.sqlMessage });
    }
    return res.json({ message: "Phân công thành công!" });
  });
};

const removeAssignment = (req, res) => {
  nhanVienService.removeAssignment(req.body, (err) => {
    if (err?.status) return res.status(err.status).json(err.body);
    if (err) return res.status(500).json(err);
    return res.json({ message: "Đã xóa phân công" });
  });
};

const updateStaff = (req, res) => {
  nhanVienService.updateStaff(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json(err);
    return res.json({ message: "Cập nhật thành công" });
  });
};

const removeStaff = (req, res) => {
  nhanVienService.removeStaff(req.params.id, (err) => {
    if (err) return res.status(500).json(err);
    return res.json({ message: "Đã xóa" });
  });
};

module.exports = {
  getList,
  getAssignments,
  createStaff,
  createAssignment,
  removeAssignment,
  updateStaff,
  removeStaff,
};
