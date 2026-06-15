/* ===== 🧾 BÁN HÀNG - ĐƠN HÀNG - REPOSITORY =====
 * Thao tác SQL với bảng donhang, chitiethoadon, ban, mon
 * ================================================ */
const db = require("../config/database");
const MonRepository = require("./monRepository");

const ACTIVE_ORDER = `
  trang_thai_thanh_toan = 'Chua thanh toan'
  AND COALESCE(trang_thai_don, '') NOT IN ('Da huy', 'Hoan thanh')
`;

const mapItems = (rows) =>
  rows.map((r) => ({
    ...r,
    so_luong_cho_bar: Math.max(0, Number(r.so_luong) - Number(r.so_luong_da_gui_bar || 0)),
  }));

const DonHangRepository = {
  /** Lấy danh sách bàn kèm tổng tiền hiện tại cho POS */
  getBanPosList: async () => {
    const [rows] = await db.execute(
      `SELECT b.ma_ban, b.ten_ban, b.trang_thai,
              CASE
                WHEN dh.ma_don_hang IS NOT NULL
                  AND EXISTS (
                    SELECT 1 FROM chitiethoadon ct2
                    WHERE ct2.ma_don_hang = dh.ma_don_hang
                  )
                THEN TRUE
                ELSE FALSE
              END AS co_khach,
              dh.ma_don_hang,
              COALESCE(blt.tong_tien, 0) AS tong_tien_hien_tai
       FROM ban b
       LEFT JOIN donhang dh
         ON dh.ma_ban = b.ma_ban AND ${ACTIVE_ORDER}
       LEFT JOIN (
         SELECT ct.ma_don_hang, SUM(ct.so_luong * ct.don_gia) AS tong_tien
         FROM chitiethoadon ct
         GROUP BY ct.ma_don_hang
       ) blt ON blt.ma_don_hang = dh.ma_don_hang
       ORDER BY b.ma_ban ASC`
    );
    return rows;
  },

  findActiveByBan: async (ma_ban) => {
    const [rows] = await db.execute(
      `SELECT * FROM donhang WHERE ma_ban = ? AND ${ACTIVE_ORDER} ORDER BY ma_don_hang DESC LIMIT 1`,
      [ma_ban]
    );
    return rows[0] || null;
  },

  create: async (ma_ban, loai_don = 'tai_cho') => {
    const [result] = await db.execute(
      `INSERT INTO donhang (ma_ban, loai_don, phi_giao_hang, trang_thai_don, trang_thai_thanh_toan) VALUES (?, ?, 0.00, 'Dang phuc vu', 'Chua thanh toan')`,
      [ma_ban || null, loai_don]
    );
    // KHÔNG set ban.trang_thai='Co khach' ở đây — chỉ set khi có món được thêm
    return result.insertId;
  },

  updateOrderType: async (ma_don_hang, loai_don) => {
    await db.execute(`UPDATE donhang SET loai_don = ? WHERE ma_don_hang = ?`, [loai_don, ma_don_hang]);
  },

  updatePhiGiaoHang: async (ma_don_hang, phi_giao_hang) => {
    const phi = parseFloat(phi_giao_hang) || 0;
    await db.execute(`UPDATE donhang SET phi_giao_hang = ? WHERE ma_don_hang = ?`, [phi, ma_don_hang]);
  },

  updateDeliveryInfo: async (ma_don_hang, { ten_khach, so_dien_thoai_giao, dia_chi_giao }) => {
    await db.execute(
      `UPDATE donhang SET ten_khach = ?, so_dien_thoai_giao = ?, dia_chi_giao = ? WHERE ma_don_hang = ?`,
      [ten_khach || null, so_dien_thoai_giao || null, dia_chi_giao || null, ma_don_hang]
    );
  },

  getById: async (id) => {
    const [rows] = await db.execute(`SELECT * FROM donhang WHERE ma_don_hang = ?`, [id]);
    return rows[0] || null;
  },

  getBanById: async (ma_ban) => {
    const [rows] = await db.execute(`SELECT * FROM ban WHERE ma_ban = ?`, [ma_ban]);
    return rows[0] || null;
  },

  getItems: async (ma_don_hang) => {
    const [rows] = await db.execute(
      `SELECT ct.*, m.ten_mon, dm.ten_danh_muc
       FROM chitiethoadon ct
       JOIN mon m ON ct.ma_mon = m.ma_mon
       LEFT JOIN danhmucmon dm ON m.ma_danh_muc = dm.ma_danh_muc
       WHERE ct.ma_don_hang = ?
       ORDER BY ct.ma_mon`,
      [ma_don_hang]
    );
    return mapItems(rows);
  },

  getOrderDetail: async (ma_don_hang) => {
    const order = await DonHangRepository.getById(ma_don_hang);
    if (!order) return null;
    const items = await DonHangRepository.getItems(ma_don_hang);
    const tong_tien = items.reduce((s, i) => s + Number(i.so_luong) * Number(i.don_gia), 0);
    const co_mon_cho_bar = items.some((i) => i.so_luong_cho_bar > 0);
    return { ...order, items, tong_tien, co_mon_cho_bar };
  },

  addOrUpdateItem: async (ma_don_hang, ma_mon, so_luong_them, ghi_chu_mon = null) => {
    const qty = parseInt(so_luong_them, 10);
    if (qty <= 0) throw new Error("Số lượng không hợp lệ");

    const [monRows] = await db.execute(
      `SELECT ten_mon, gia_ban, trang_thai_ban FROM mon WHERE ma_mon = ?`,
      [ma_mon]
    );
    if (!monRows.length) throw new Error("Món không tồn tại");
    if (!monRows[0].trang_thai_ban) throw new Error(`Món "${monRows[0].ten_mon}" đang tạm ngưng`);

    await MonRepository.assertCanSell(ma_mon, qty);

    const [existing] = await db.execute(
      `SELECT so_luong FROM chitiethoadon WHERE ma_don_hang = ? AND ma_mon = ?`,
      [ma_don_hang, ma_mon]
    );

    if (existing.length) {
      await db.execute(
        `UPDATE chitiethoadon SET so_luong = so_luong + ?, ghi_chu_mon = COALESCE(?, ghi_chu_mon)
         WHERE ma_don_hang = ? AND ma_mon = ?`,
        [qty, ghi_chu_mon, ma_don_hang, ma_mon]
      );
    } else {
      await db.execute(
        `INSERT INTO chitiethoadon (ma_don_hang, ma_mon, so_luong, so_luong_da_gui_bar, don_gia, ghi_chu_mon, trang_thai_mon)
         VALUES (?, ?, ?, 0, ?, ?, 'Dang cho')`,
        [ma_don_hang, ma_mon, qty, monRows[0].gia_ban, ghi_chu_mon]
      );

      // Đây là món đầu tiên của đơn → đánh dấu bàn là 'Có khách'
      const order = await DonHangRepository.getById(ma_don_hang);
      if (order && order.ma_ban) {
        await db.execute(`UPDATE ban SET trang_thai = 'Co khach' WHERE ma_ban = ?`, [order.ma_ban]);
      }
    }
  },

  updateItemQty: async (ma_don_hang, ma_mon, so_luong) => {
    const qty = parseInt(so_luong, 10);

    // Lấy so_luong_da_gui_bar hiện tại
    const [rows] = await db.execute(
      `SELECT so_luong_da_gui_bar FROM chitiethoadon WHERE ma_don_hang = ? AND ma_mon = ?`,
      [ma_don_hang, ma_mon]
    );
    const daGui = rows.length ? Number(rows[0].so_luong_da_gui_bar) : 0;

    if (qty < daGui) {
      throw new Error(
        `Món này đã in ${daGui} cái xuống bar. Không thể giảm dưới số lượng đã in.`
      );
    }

    if (qty <= 0) {
      await db.execute(`DELETE FROM chitiethoadon WHERE ma_don_hang = ? AND ma_mon = ?`, [
        ma_don_hang,
        ma_mon,
      ]);
      // Kiểm tra nếu đơn không còn món nào → reset bàn về 'Trong'
      const [remaining] = await db.execute(
        `SELECT COUNT(*) AS cnt FROM chitiethoadon WHERE ma_don_hang = ?`,
        [ma_don_hang]
      );
      if (remaining[0].cnt === 0) {
        const order = await DonHangRepository.getById(ma_don_hang);
        if (order && order.ma_ban) {
          await db.execute(`UPDATE ban SET trang_thai = 'Trong' WHERE ma_ban = ?`, [order.ma_ban]);
        }
      }
      return;
    }
    await db.execute(
      `UPDATE chitiethoadon SET so_luong = ?,
        so_luong_da_gui_bar = LEAST(COALESCE(so_luong_da_gui_bar, 0), ?)
       WHERE ma_don_hang = ? AND ma_mon = ?`,
      [qty, qty, ma_don_hang, ma_mon]
    );
  },

  sendToBar: async (ma_don_hang) => {
    const [r] = await db.execute(
      `UPDATE chitiethoadon SET so_luong_da_gui_bar = so_luong, trang_thai_mon = 'Dang lam'
       WHERE ma_don_hang = ? AND so_luong > COALESCE(so_luong_da_gui_bar, 0)`,
      [ma_don_hang]
    );
    return r.affectedRows;
  },

  getBarQueue: async () => {
    const [rows] = await db.execute(
      `SELECT b.ma_ban, b.ten_ban, dh.ma_don_hang, ct.ma_mon, m.ten_mon,
              (ct.so_luong - COALESCE(ct.so_luong_da_gui_bar, 0)) AS so_luong,
              ct.ghi_chu_mon, dh.ngay_tao
       FROM donhang dh
       INNER JOIN ban b ON dh.ma_ban = b.ma_ban
       INNER JOIN chitiethoadon ct ON dh.ma_don_hang = ct.ma_don_hang
       INNER JOIN mon m ON ct.ma_mon = m.ma_mon
       WHERE ${ACTIVE_ORDER}
         AND ct.so_luong > COALESCE(ct.so_luong_da_gui_bar, 0)
       ORDER BY dh.ma_don_hang ASC, ct.ma_mon ASC`
    );
    return rows;
  },

  moveOrder: async (ma_don_hang, ma_ban_moi) => {
    const order = await DonHangRepository.getById(ma_don_hang);
    if (!order) throw new Error("Đơn không tồn tại");
    if (order.trang_thai_thanh_toan === 'Da thanh toan') throw new Error("Đơn đã thanh toán, không thể chuyển");

    const existing = await DonHangRepository.findActiveByBan(ma_ban_moi);
    if (existing && existing.ma_don_hang !== ma_don_hang) {
      throw new Error(`Bàn đích đang có khách (đơn #${existing.ma_don_hang})`);
    }

    const oldMaBan = order.ma_ban;
    await db.execute(`UPDATE donhang SET ma_ban = ? WHERE ma_don_hang = ?`, [ma_ban_moi, ma_don_hang]);

    if (oldMaBan) {
      const [other] = await db.execute(
        `SELECT ma_don_hang FROM donhang WHERE ma_ban = ? AND ${ACTIVE_ORDER} AND ma_don_hang != ? LIMIT 1`,
        [oldMaBan, ma_don_hang]
      );
      if (!other.length) {
        await db.execute(`UPDATE ban SET trang_thai = 'Trong' WHERE ma_ban = ?`, [oldMaBan]);
      }
    }
    await db.execute(`UPDATE ban SET trang_thai = 'Co khach' WHERE ma_ban = ?`, [ma_ban_moi]);

    return DonHangRepository.getOrderDetail(ma_don_hang);
  },

  cancelOrder: async (ma_don_hang) => {
    const order = await DonHangRepository.getById(ma_don_hang);
    if (!order) throw new Error("Đơn không tồn tại");
    await db.execute(`DELETE FROM chitiethoadon WHERE ma_don_hang = ?`, [ma_don_hang]);
    await db.execute(
      `UPDATE donhang SET trang_thai_don = 'Da huy', trang_thai_thanh_toan = 'Da huy' WHERE ma_don_hang = ?`,
      [ma_don_hang]
    );
    // Reset bàn về 'Trong' nếu không còn đơn active nào khác tại bàn đó
    if (order.ma_ban) {
      const [other] = await db.execute(
        `SELECT ma_don_hang FROM donhang WHERE ma_ban = ? AND ${ACTIVE_ORDER} AND ma_don_hang != ? LIMIT 1`,
        [order.ma_ban, ma_don_hang]
      );
      if (!other.length) {
        await db.execute(`UPDATE ban SET trang_thai = 'Trong' WHERE ma_ban = ?`, [order.ma_ban]);
      }
    }
  },

  checkout: async (ma_don_hang, hinh_thuc_thanh_toan = null) => {
    const order = await DonHangRepository.getById(ma_don_hang);
    if (!order) throw new Error("Đơn không tồn tại");
    if (order.trang_thai_thanh_toan === "Da thanh toan") throw new Error("Đơn đã thanh toán");

    const items = await DonHangRepository.getItems(ma_don_hang);
    if (!items.length) throw new Error("Đơn trống");

    for (const item of items) {
      await MonRepository.assertCanSell(item.ma_mon, item.so_luong);
    }

    for (const item of items) {
      await MonRepository.deductStockByOrder(item.ma_mon, item.so_luong);
    }

    if (hinh_thuc_thanh_toan) {
      await db.execute(
        `UPDATE donhang SET trang_thai_don = 'Hoan thanh', trang_thai_thanh_toan = 'Da thanh toan', hinh_thuc_thanh_toan = ? WHERE ma_don_hang = ?`,
        [hinh_thuc_thanh_toan, ma_don_hang]
      );
    } else {
      await db.execute(
        `UPDATE donhang SET trang_thai_don = 'Hoan thanh', trang_thai_thanh_toan = 'Da thanh toan' WHERE ma_don_hang = ?`,
        [ma_don_hang]
      );
    }
    if (order.ma_ban) {
      await db.execute(`UPDATE ban SET trang_thai = 'Trong' WHERE ma_ban = ?`, [order.ma_ban]);
    }
    return DonHangRepository.getOrderDetail(ma_don_hang);
  },
};

module.exports = DonHangRepository;
