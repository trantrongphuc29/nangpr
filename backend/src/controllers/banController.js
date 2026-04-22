const banService = require("../services/banService");

const getList = (req, res) => {
  banService.getList(req.query.sort, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Lỗi server",
        error: err.message,
      });
    }
    return res.json(result);
  });
};

const create = (req, res) => {
  banService.create(req.body.ten_ban, (err, result) => {
    if (err?.status) return res.status(err.status).json(err.body);
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: `Tên bàn "${req.body.ten_ban?.trim()}" đã tồn tại. Vui lòng chọn tên khác.`,
      });
    }
    if (err) {
      return res.status(500).json({
        message: "Lỗi server khi thêm bàn",
        error: err.message,
      });
    }
    return res.json({ message: "Thêm bàn thành công", ma_ban: result.insertId });
  });
};

const update = (req, res) => {
  banService.update(req.params.id, req.body.ten_ban, (err) => {
    if (err?.status) return res.status(err.status).json(err.body);
    if (err) {
      return res.status(500).json({
        message: "Lỗi cập nhật",
        error: err.message,
      });
    }
    return res.json({ message: "Cập nhật thành công" });
  });
};

const remove = (req, res) => {
  banService.remove(req.params.id, (err) => {
    if (err) return res.status(500).json({ message: "Lỗi server", error: err.message });
    return res.json({ message: "Xoá bàn thành công" });
  });
};

module.exports = {
  getList,
  create,
  update,
  remove,
};
