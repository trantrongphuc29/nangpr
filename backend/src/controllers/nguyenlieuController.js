/* =====  NGUYÊN LIỆU =====
 * Tiếp nhận request HTTP, gọi Service, trả response
 * ========================================= */
const NguyenLieuService = require('../services/nguyenlieuService');

const NguyenLieuController = {
  importStock: async (req, res) => {
    try {
      const result = await NguyenLieuService.nhapKho(req.body);
      res.status(201).json({ message: "Nhập kho thành công!", data: result });
    } catch (error) { res.status(400).json({ message: error.message }); }
  },

  getHistory: async (req, res) => {
    try {
      const data = await NguyenLieuService.getLichSu();
      res.json(data);
    } catch (error) { res.status(500).json({ message: error.message }); }
  },

  getReportStats: async (req, res) => {
    try {
      const data = await NguyenLieuService.getChiPhiStats();
      res.json(data);
    } catch (error) { res.status(500).json({ message: error.message }); }
  },

  getAll: async (req, res) => {
    try {
      const data = await NguyenLieuService.getDanhSach();
      res.json(data);
    } catch (error) { res.status(500).json({ message: error.message }); }
  },

  create: async (req, res) => {
    try {
      const id = await NguyenLieuService.themMoi(req.body);
      const data = await NguyenLieuService.getDanhSach();
      const created = data.find((r) => r.ma_nguyen_lieu === id);
      res.status(201).json({ id, message: "Thêm nguyên liệu thành công!", data: created });
    } catch (error) { res.status(400).json({ message: error.message }); }
  },

  getCategories: async (req, res) => {
    try {
      const data = await NguyenLieuService.getDanhMuc();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const cleanId = parseInt(req.params.id);
      if (isNaN(cleanId)) {
        return res.status(400).json({ message: "Mã định danh nguyên liệu không hợp lệ!" });
      }

      await NguyenLieuService.capNhat(cleanId, req.body);
      return res.json({ message: "Cập nhật thành công!" });
    } catch (error) { 
      return res.status(400).json({ message: error.message }); 
    }
  },

  delete: async (req, res) => {
    try {
      await NguyenLieuService.xoa(req.params.id);
      res.json({ message: "Đã xóa nguyên liệu!" });
    } catch (error) { res.status(400).json({ message: error.message }); }
  },

  getExpiredHistory: async (req, res) => {
    try {
      const data = await NguyenLieuService.getLichSuHetHan();
      res.json(data);
    } catch (error) { res.status(500).json({ message: error.message }); }
  },

  setStatus: async (req, res) => {
    try {
      const cleanId = parseInt(req.params.id);
      await NguyenLieuService.doiTrangThai(cleanId, req.body.trang_thai);
      res.json({
        message: req.body.trang_thai ? "Đã kích hoạt nguyên liệu." : "Đã ngưng sử dụng nguyên liệu.",
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = NguyenLieuController;