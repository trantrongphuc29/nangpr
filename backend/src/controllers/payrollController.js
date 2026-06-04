const payrollService = require("../services/payrollService");

function parseIntSafe(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeMoneyInt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

async function getBangCong(req, res) {
  try {
    const thang = parseIntSafe(req.query.thang);
    const nam = parseIntSafe(req.query.nam);
    const ma_nhan_vien = req.query.ma_nhan_vien ? parseIntSafe(req.query.ma_nhan_vien) : null;

    if (!thang || !nam) {
      return res.status(400).json({ message: "Thiếu tham số thang/nam" });
    }

    const result = await payrollService.getBangCong({ thang, nam, ma_nhan_vien });
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi lấy bảng công", error: err.message });
  }
}

async function getBangCongChiTiet(req, res) {
  try {
    const thang = parseIntSafe(req.query.thang);
    const nam = parseIntSafe(req.query.nam);
    const ma_nhan_vien = req.query.ma_nhan_vien ? parseIntSafe(req.query.ma_nhan_vien) : null;

    if (!thang || !nam || !ma_nhan_vien) {
      return res.status(400).json({ message: "Thiếu tham số thang/nam/ma_nhan_vien" });
    }

    const result = await payrollService.getBangCongChiTiet({ thang, nam, ma_nhan_vien });
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi lấy chi tiết bảng công", error: err.message });
  }
}

async function getBangLuong(req, res) {
  try {
    const thang = parseIntSafe(req.query.thang);
    const nam = parseIntSafe(req.query.nam);
    const ma_nhan_vien = req.query.ma_nhan_vien ? parseIntSafe(req.query.ma_nhan_vien) : null;

    if (!thang || !nam) {
      return res.status(400).json({ message: "Thiếu tham số thang/nam" });
    }

    const result = await payrollService.getBangLuong({ thang, nam, ma_nhan_vien });
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi lấy bảng lương", error: err.message });
  }
}

async function updateBangLuongEmployee(req, res) {
  try {
    const { thang, nam, ma_nhan_vien, phu_cap, thuong, khau_tru, tam_ung } = req.body || {};

    const thangNum = parseIntSafe(thang);
    const namNum = parseIntSafe(nam);
    const maNum = parseIntSafe(ma_nhan_vien);
    if (!thangNum || !namNum || !maNum) {
      return res.status(400).json({ message: "Thiếu tham số thang/nam/ma_nhan_vien" });
    }

    const result = await payrollService.updateBangLuongEmployee({
      thang: thangNum,
      nam: namNum,
      ma_nhan_vien: maNum,
      phu_cap: normalizeMoneyInt(phu_cap),
      thuong: normalizeMoneyInt(thuong),
      khau_tru: normalizeMoneyInt(khau_tru),
      tam_ung: normalizeMoneyInt(tam_ung),
    });
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi cập nhật bảng lương", error: err.message });
  }
}

async function lockKyLuong(req, res) {
  try {
    const { thang, nam } = req.body || {};
    const thangNum = parseIntSafe(thang);
    const namNum = parseIntSafe(nam);
    if (!thangNum || !namNum) return res.status(400).json({ message: "Thiếu tham số thang/nam" });

    await payrollService.lockKyLuong({ thang: thangNum, nam: namNum });
    return res.json({ message: "Đã chốt lương" });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi chốt lương", error: err.message });
  }
}

async function unlockKyLuong(req, res) {
  try {
    const { thang, nam } = req.body || {};
    const thangNum = parseIntSafe(thang);
    const namNum = parseIntSafe(nam);
    if (!thangNum || !namNum) return res.status(400).json({ message: "Thiếu tham số thang/nam" });

    await payrollService.unlockKyLuong({ thang: thangNum, nam: namNum });
    return res.json({ message: "Đã mở chốt lương" });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi mở chốt", error: err.message });
  }
}

async function markKyLuongPaid(req, res) {
  try {
    const { thang, nam } = req.body || {};
    const thangNum = parseIntSafe(thang);
    const namNum = parseIntSafe(nam);
    if (!thangNum || !namNum) return res.status(400).json({ message: "Thiếu tham số thang/nam" });

    await payrollService.markKyLuongPaid({ thang: thangNum, nam: namNum });
    return res.json({ message: "Đã đánh dấu thanh toán" });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi đánh dấu đã thanh toán", error: err.message });
  }
}

async function getLuongNhanVien(req, res) {
  try {
    const result = await payrollService.getLuongNhanVien();
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi lấy cấu hình lương", error: err.message });
  }
}

async function upsertLuongNhanVienBulk(req, res) {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Thiếu items (mảng)" });
    }

    const result = await payrollService.upsertLuongNhanVienBulk({ items });
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi cập nhật lương nhân viên", error: err.message });
  }
}

module.exports = {
  getBangCong,
  getBangCongChiTiet,
  getBangLuong,
  updateBangLuongEmployee,
  lockKyLuong,
  unlockKyLuong,
  markKyLuongPaid,
  getLuongNhanVien,
  upsertLuongNhanVienBulk,
};

