/* ===== BÁN HÀNG - ĐƠN HÀNG =====
 * Thao tác SQL với bảng donhang, chitiethoadon, ban, mon
 * ================================================ */
const db = require("../config/database");
const MonRepository = require("./monRepository");

const ACTIVE_ORDER = `
  trang_thai_thanh_toan = 'Chua thanh toan'
  AND COALESCE(trang_thai_don, '') NOT IN ('Da huy', 'Hoan thanh')
`;

const toSafeInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

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

  /** Cập nhật ghi chú cho một món trong đơn */
  updateItemNote: async (ma_don_hang, ma_mon, ghi_chu_mon) => {
    await db.execute(
      `UPDATE chitiethoadon SET ghi_chu_mon = ? WHERE ma_don_hang = ? AND ma_mon = ?`,
      [ghi_chu_mon || null, ma_don_hang, ma_mon]
    );
  },

  /** Ghi log huỷ món */
  logCancelItem: async (ma_don_hang, ma_mon, ten_mon, so_luong_huy) => {
    await db.execute(
      `INSERT INTO huy_mon_log (ma_don_hang, ma_mon, ten_mon, so_luong_huy, ngay_huy)
       VALUES (?, ?, ?, ?, NOW())`,
      [ma_don_hang, ma_mon, ten_mon, so_luong_huy]
    );
  },

  updateItemQty: async (ma_don_hang, ma_mon, so_luong) => {
    const qty = parseInt(so_luong, 10);

    // Lấy thông tin hiện tại (gồm so_luong_da_gui_bar + ten_mon)
    const [rows] = await db.execute(
      `SELECT ct.*, m.ten_mon FROM chitiethoadon ct
       JOIN mon m ON ct.ma_mon = m.ma_mon
       WHERE ct.ma_don_hang = ? AND ct.ma_mon = ?`,
      [ma_don_hang, ma_mon]
    );
    if (!rows.length) throw new Error("Món không tồn tại trong đơn");

    const daGui = Number(rows[0].so_luong_da_gui_bar);
    const currentQty = Number(rows[0].so_luong);
    const tenMon = rows[0].ten_mon;

    if (qty > currentQty) {
      // Tăng số lượng — kiểm tra tồn kho trước
      const delta = qty - currentQty;
      await MonRepository.assertCanSell(ma_mon, delta);
      await db.execute(
        `UPDATE chitiethoadon SET so_luong = ? WHERE ma_don_hang = ? AND ma_mon = ?`,
        [qty, ma_don_hang, ma_mon]
      );
      return;
    }

    if (qty === currentQty) {
      return; // Không thay đổi
    }

    // Đây là trường hợp GIẢM số lượng
    const soLuongHuy = currentQty - qty;

    // Nếu món đã in → ghi log huỷ
    if (daGui > 0 && soLuongHuy > 0) {
      await DonHangRepository.logCancelItem(
        ma_don_hang, ma_mon, tenMon, soLuongHuy
      );
    }

    if (qty <= 0) {
      // Hoàn trả kho cho món đã gửi bar trước khi xoá
      if (daGui > 0) {
        await MonRepository.deductStockByOrder(ma_mon, -daGui);
      }

      // Xoá hẳn món khỏi đơn
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

    // Giảm số lượng (qty > 0)
    // Hoàn trả kho nếu giảm số lượng đã gửi bar
    if (daGui > qty) {
      await MonRepository.deductStockByOrder(ma_mon, -(daGui - qty));
    }

    await db.execute(
      `UPDATE chitiethoadon SET so_luong = ?,
        so_luong_da_gui_bar = LEAST(COALESCE(so_luong_da_gui_bar, 0), ?)
       WHERE ma_don_hang = ? AND ma_mon = ?`,
      [qty, qty, ma_don_hang, ma_mon]
    );
  },

  /** Lấy lịch sử huỷ món của một đơn */
  getCancelHistory: async (ma_don_hang) => {
    const [rows] = await db.execute(
      `SELECT * FROM huy_mon_log WHERE ma_don_hang = ? ORDER BY ngay_huy DESC`,
      [ma_don_hang]
    );
    return rows;
  },

  /** Lấy danh sách đơn đã hoàn thành (cho lịch sử bán hàng) */
  getCompletedOrders: async (limit = 50, offset = 0) => {
    const safeLimit = toSafeInt(limit, 50);
    const safeOffset = toSafeInt(offset, 0);
    const [rows] = await db.execute(
      `SELECT dh.*, b.ten_ban,
              COALESCE(SUM(ct.so_luong * ct.don_gia), 0) AS tong_tien
       FROM donhang dh
       LEFT JOIN ban b ON dh.ma_ban = b.ma_ban
       LEFT JOIN chitiethoadon ct ON dh.ma_don_hang = ct.ma_don_hang
       WHERE dh.trang_thai_thanh_toan = 'Da thanh toan'
       GROUP BY dh.ma_don_hang
       ORDER BY dh.ngay_tao DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`
    );
    return rows;
  },

  /** Format Date thành YYYY-MM-DD theo giờ Việt Nam (UTC+7) bất kể server timezone */
  fmtLocalDate: (d) => {
    const vn = new Date(d.getTime() + 7 * 3600000);
    const y = vn.getUTCFullYear();
    const m = String(vn.getUTCMonth() + 1).padStart(2, '0');
    const day = String(vn.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  /** Báo cáo doanh thu với bộ lọc + phân trang */
  getRevenueReport: async ({ period, date, from_date, to_date, loai_don, hinh_thuc_thanh_toan, limit = 20, offset = 0 }) => {
    let dateFilter;
    let dateParams = [];
    const fmtLocal = DonHangRepository.fmtLocalDate;

    if (from_date && to_date) {
      dateFilter = `dh.ngay_tao + INTERVAL 7 HOUR >= ? AND dh.ngay_tao + INTERVAL 7 HOUR < ? + INTERVAL 1 DAY`;
      dateParams = [`${from_date} 00:00:00`, to_date];
    } else {
      const refDate = date ? new Date(date) : new Date();
      if (period === 'day') {
      const d = fmtLocal(refDate);
      dateFilter = `dh.ngay_tao + INTERVAL 7 HOUR >= ? AND dh.ngay_tao + INTERVAL 7 HOUR < ? + INTERVAL 1 DAY`;
      dateParams = [`${d} 00:00:00`, d];
    } else if (period === 'week') {
      const dayOfWeek = refDate.getDay();
      const monday = new Date(refDate);
      monday.setDate(refDate.getDate() - ((dayOfWeek + 6) % 7));
      const mondayStr = fmtLocal(monday);
      dateFilter = `dh.ngay_tao + INTERVAL 7 HOUR >= ? AND dh.ngay_tao + INTERVAL 7 HOUR < ? + INTERVAL 7 DAY`;
      dateParams = [`${mondayStr} 00:00:00`, mondayStr];
    } else if (period === 'month') {
      const y = refDate.getFullYear();
      const m = String(refDate.getMonth() + 1).padStart(2, '0');
      dateFilter = `dh.ngay_tao + INTERVAL 7 HOUR >= ? AND dh.ngay_tao + INTERVAL 7 HOUR < ? + INTERVAL 1 MONTH`;
      dateParams = [`${y}-${m}-01 00:00:00`, `${y}-${m}-01`];
    } else if (period === 'year') {
      const y = refDate.getFullYear();
      dateFilter = `dh.ngay_tao + INTERVAL 7 HOUR >= ? AND dh.ngay_tao + INTERVAL 7 HOUR < ?`;
      dateParams = [`${y}-01-01 00:00:00`, `${y + 1}-01-01 00:00:00`];
    } else {
      dateFilter = '1=1';
    }
    }

    const whereParts = [`dh.trang_thai_thanh_toan = 'Da thanh toan'`, dateFilter];
    const params = [...dateParams];
    if (loai_don) { whereParts.push('dh.loai_don = ?'); params.push(loai_don); }
    if (hinh_thuc_thanh_toan) { whereParts.push('dh.hinh_thuc_thanh_toan = ?'); params.push(hinh_thuc_thanh_toan); }
    const where = whereParts.join(' AND ');

    // Đếm tổng số đơn (không phân trang)
    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS cnt FROM (
         SELECT dh.ma_don_hang FROM donhang dh WHERE ${where} GROUP BY dh.ma_don_hang
       ) sub`,
      params
    );
    const total_count = Number(countRows[0].cnt);

    // Tính tổng doanh thu (không phân trang) — dùng subquery để tránh JOIN duplicate
    const [totalRows] = await db.execute(
      `SELECT COALESCE(SUM(sub.tong_tien), 0) AS total_revenue,
              COALESCE(SUM(sub.phi), 0) AS total_phi_gh
       FROM (
         SELECT dh.ma_don_hang, dh.phi_giao_hang AS phi,
                COALESCE(SUM(ct.so_luong * ct.don_gia), 0) AS tong_tien
         FROM donhang dh
         LEFT JOIN chitiethoadon ct ON dh.ma_don_hang = ct.ma_don_hang
         WHERE ${where}
         GROUP BY dh.ma_don_hang
       ) sub`,
      params
    );

    // Xác định cách gom nhóm theo thời gian cho biểu đồ
    let bucketExpr, bucketType;
    if (from_date && to_date) {
      bucketExpr = `DATE_FORMAT(dh.ngay_tao + INTERVAL 7 HOUR, '%Y-%m-%d')`; bucketType = 'date';
    } else if (period === 'day') {
      bucketExpr = `DATE_FORMAT(dh.ngay_tao + INTERVAL 7 HOUR, '%H')`; bucketType = 'hour';
    } else if (period === 'year') {
      bucketExpr = `DATE_FORMAT(dh.ngay_tao + INTERVAL 7 HOUR, '%Y-%m')`; bucketType = 'month';
    } else {
      // week, month (và mặc định): gom theo ngày
      bucketExpr = `DATE_FORMAT(dh.ngay_tao + INTERVAL 7 HOUR, '%Y-%m-%d')`; bucketType = 'date';
    }

    // Chuỗi doanh thu theo thời gian (không phân trang) cho biểu đồ
    const [seriesRows] = await db.execute(
      `SELECT sub.bucket AS bucket,
              COALESCE(SUM(sub.tong_tien), 0) AS revenue,
              COUNT(*) AS orders
       FROM (
         SELECT dh.ma_don_hang, ${bucketExpr} AS bucket,
                COALESCE(SUM(ct.so_luong * ct.don_gia), 0) AS tong_tien
         FROM donhang dh
         LEFT JOIN chitiethoadon ct ON dh.ma_don_hang = ct.ma_don_hang
         WHERE ${where}
         GROUP BY dh.ma_don_hang
       ) sub
       GROUP BY sub.bucket
       ORDER BY sub.bucket`,
      params
    );
    const series = seriesRows.map(r => ({
      bucket: String(r.bucket),
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    }));

    if (!total_count) {
      return {
        orders: [],
        summary: { total_orders: 0, total_revenue: 0, total_phi_gh: 0 },
        series: [],
        bucket_type: bucketType,
        pagination: { total: 0, limit, offset, page: Math.floor(offset / limit) + 1, total_pages: 0 },
      };
    }

    // Lấy danh sách đơn có phân trang
    const safeLimit = toSafeInt(limit, 20);
    const safeOffset = toSafeInt(offset, 0);
    const [orders] = await db.execute(
      `SELECT dh.*, b.ten_ban,
              COALESCE(SUM(ct.so_luong * ct.don_gia), 0) AS tong_tien
       FROM donhang dh
       LEFT JOIN ban b ON dh.ma_ban = b.ma_ban
       LEFT JOIN chitiethoadon ct ON dh.ma_don_hang = ct.ma_don_hang
       WHERE ${where}
       GROUP BY dh.ma_don_hang
       ORDER BY dh.ngay_tao DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );

    // Lấy items cho các đơn ở trang hiện tại
    const ids = orders.map(o => o.ma_don_hang);
    let items = [];
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      [items] = await db.execute(
        `SELECT ct.*, m.ten_mon, dm.ten_danh_muc
         FROM chitiethoadon ct
         JOIN mon m ON ct.ma_mon = m.ma_mon
         LEFT JOIN danhmucmon dm ON m.ma_danh_muc = dm.ma_danh_muc
         WHERE ct.ma_don_hang IN (${placeholders})
         ORDER BY ct.ma_don_hang, ct.ma_mon`,
        ids
      );
    }

    // Gộp items vào orders
    const itemMap = {};
    items.forEach(i => {
      if (!itemMap[i.ma_don_hang]) itemMap[i.ma_don_hang] = [];
      itemMap[i.ma_don_hang].push(i);
    });

    const ordersWithItems = orders.map(o => ({
      ...o,
      items: itemMap[o.ma_don_hang] || [],
    }));

    const total_pages = Math.ceil(total_count / limit) || 1;
    const current_page = Math.floor(offset / limit) + 1;

    return {
      orders: ordersWithItems,
      summary: {
        total_orders: total_count,
        total_revenue: Number(totalRows[0].total_revenue),
        total_phi_gh: Number(totalRows[0].total_phi_gh),
      },
      series,
      bucket_type: bucketType,
      pagination: {
        total: total_count,
        limit,
        offset,
        page: current_page,
        total_pages,
        has_next: current_page < total_pages,
        has_prev: current_page > 1,
      },
    };
  },

  /** Lấy tất cả lịch sử huỷ (có phân trang) */
  getAllCancelHistory: async (limit = 50, offset = 0) => {
    const safeLimit = toSafeInt(limit, 50);
    const safeOffset = toSafeInt(offset, 0);
    const [rows] = await db.execute(
      `SELECT h.*, dh.ma_ban, b.ten_ban
       FROM huy_mon_log h
       LEFT JOIN donhang dh ON h.ma_don_hang = dh.ma_don_hang
       LEFT JOIN ban b ON dh.ma_ban = b.ma_ban
       ORDER BY h.ngay_huy DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`
    );
    return rows;
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

    // Hoàn trả kho cho món đã gửi bar trước khi xoá
    const items = await DonHangRepository.getItems(ma_don_hang);
    for (const item of items) {
      const daGui = Number(item.so_luong_da_gui_bar || 0);
      if (daGui > 0) {
        await MonRepository.deductStockByOrder(item.ma_mon, -daGui);
      }
    }

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

    // Chỉ trừ kho cho món chưa gửi bar
    // Món đã gửi bar đã được kiểm tra + trừ kho lúc gửi
    for (const item of items) {
      const soLuongChuaGui = Number(item.so_luong) - Number(item.so_luong_da_gui_bar || 0);
      if (soLuongChuaGui > 0) {
        await MonRepository.assertCanSell(item.ma_mon, soLuongChuaGui);
        await MonRepository.deductStockByOrder(item.ma_mon, soLuongChuaGui);
      }
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
// Điều kiện "đơn còn hiệu lực" — dùng chung cho các module khác (vd: chặn xóa bàn đang phục vụ)
module.exports.ACTIVE_ORDER = ACTIVE_ORDER;
