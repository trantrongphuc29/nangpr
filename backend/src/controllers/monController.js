const MonService = require('../services/monService');

const MonController = {
  getAll: async (req, res) => {
    try {
      const data = await MonService.getDanhSachMon();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getCategoryList: async (req, res) => {
    try {
      const data = await MonService.getDanhMucMenu();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const id = await MonService.themMonMoi(req.body);
      res.status(201).json({ id, message: "Tạo món nước và cấu hình công thức thành công!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const ma_mon = parseInt(req.params.id);
      await MonService.capNhatMon(ma_mon, req.body);
      res.json({ message: "Cập nhật món và thay đổi công thức thành công!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await MonService.xoaMon(req.params.id);
      res.json({ message: "Đã xóa món nước khỏi thực đơn hệ thống!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  sellDish: async (req, res) => {
    try {
      const { ma_mon, so_luong } = req.body;
      await MonService.truKhoKhiBanHang(parseInt(ma_mon), parseFloat(so_luong));
      res.json({ message: "✅ Đã xuất kho pha chế và trừ vật tư thành công!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = MonController;