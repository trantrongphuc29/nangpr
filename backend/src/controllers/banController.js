const banService = require("../services/banService");

const getList = async (req, res) => {
  try {
    const result = await banService.getList(req.query.sort);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server khi lấy danh sách bàn", error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const result = await banService.create(req.body.ten_ban);
    return res.json({ message: "Thêm bàn thành công", ma_ban: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: `Tên bàn "${req.body.ten_ban?.trim()}" đã tồn tại. Vui lòng chọn tên khác.`,
      });
    }
    return res.status(err.status || 500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    await banService.update(req.params.id, req.body.ten_ban);
    return res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await banService.remove(req.params.id);
    return res.json({ message: "Xoá bàn thành công" });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server khi xóa bàn", error: err.message });
  }
};

const getPosList = async (req, res) => {
  try {
    const result = await banService.getPosList();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server khi lấy danh sách bàn POS", error: err.message });
  }
};

module.exports = {
  getList,
  create,
  update,
  remove,
  getPosList,
};