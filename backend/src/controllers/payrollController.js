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

async function getTopNhanVienNangNo(req, res) {
  try {
    const thang = parseIntSafe(req.query.thang);
    const nam = parseIntSafe(req.query.nam);
    const limit = req.query.limit ? parseIntSafe(req.query.limit) : 5;

    if (!thang || !nam) {
      return res.status(400).json({ message: "Thiếu tham số thang/nam" });
    }

    const result = await payrollService.getTopNhanVienNangNo({ thang, nam, limit });
    return res.json(result);
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Lỗi lấy top nhân viên năng nổ", error: err.message });
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

async function getDieuChinh(req, res) {
  try {
    const thang = parseIntSafe(req.query.thang);
    const nam = parseIntSafe(req.query.nam);
    const ma_nhan_vien = parseIntSafe(req.query.ma_nhan_vien);
    const loai = req.query.loai;

    if (!thang || !nam || !ma_nhan_vien || !loai) {
      return res.status(400).json({ message: "Thiếu tham số thang/nam/ma_nhan_vien/loai" });
    }

    const result = await payrollService.getDieuChinh({ thang, nam, ma_nhan_vien, loai });
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi lấy khoản điều chỉnh", error: err.message });
  }
}

async function addDieuChinh(req, res) {
  try {
    const { thang, nam, ma_nhan_vien, loai, so_tien, ly_do, ngay } = req.body || {};

    const thangNum = parseIntSafe(thang);
    const namNum = parseIntSafe(nam);
    const maNum = parseIntSafe(ma_nhan_vien);
    if (!thangNum || !namNum || !maNum || !loai) {
      return res.status(400).json({ message: "Thiếu tham số thang/nam/ma_nhan_vien/loai" });
    }

    const result = await payrollService.addDieuChinh({
      thang: thangNum,
      nam: namNum,
      ma_nhan_vien: maNum,
      loai,
      so_tien: normalizeMoneyInt(so_tien),
      ly_do,
      ngay,
    });
    return res.json({ message: "Đã thêm khoản", ...result });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi thêm khoản điều chỉnh", error: err.message });
  }
}

async function deleteDieuChinh(req, res) {
  try {
    const id = parseIntSafe(req.params.id);
    const thang = parseIntSafe(req.query.thang);
    const nam = parseIntSafe(req.query.nam);
    if (!id || !thang || !nam) {
      return res.status(400).json({ message: "Thiếu tham số id/thang/nam" });
    }

    const result = await payrollService.deleteDieuChinh({ thang, nam, id });
    return res.json({ message: "Đã xóa khoản", ...result });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi xóa khoản điều chỉnh", error: err.message });
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

async function revertKyLuongPaid(req, res) {
  try {
    const { thang, nam, mat_khau } = req.body || {};
    const thangNum = parseIntSafe(thang);
    const namNum = parseIntSafe(nam);
    if (!thangNum || !namNum) return res.status(400).json({ message: "Thiếu tham số thang/nam" });
    if (!mat_khau) return res.status(400).json({ message: "Vui lòng nhập mật khẩu admin" });

    await payrollService.revertKyLuongPaid({ thang: thangNum, nam: namNum, mat_khau });
    return res.json({ message: "Đã hoàn tác trạng thái thanh toán" });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi hoàn tác thanh toán", error: err.message });
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

async function getNgayLe(req, res) {
  try {
    const result = await payrollService.getNgayLe();
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi lấy ngày lễ", error: err.message });
  }
}

async function upsertNgayLe(req, res) {
  try {
    const { ngay, ten, he_so } = req.body || {};
    const result = await payrollService.upsertNgayLe({ ngay, ten, he_so });
    return res.json({ message: "Đã lưu ngày lễ", data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi lưu ngày lễ", error: err.message });
  }
}

async function deleteNgayLe(req, res) {
  try {
    await payrollService.deleteNgayLe({ ngay: req.params.ngay });
    return res.json({ message: "Đã xóa ngày lễ" });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Lỗi xóa ngày lễ", error: err.message });
  }
}

module.exports = {
  getBangCong,
  getBangCongChiTiet,
  getTopNhanVienNangNo,
  getBangLuong,
  getDieuChinh,
  addDieuChinh,
  deleteDieuChinh,
  lockKyLuong,
  unlockKyLuong,
  markKyLuongPaid,
  revertKyLuongPaid,
  getLuongNhanVien,
  upsertLuongNhanVienBulk,
  getNgayLe,
  upsertNgayLe,
  deleteNgayLe,
};

