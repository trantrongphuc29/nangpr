/* ===== 🥬 NGUYÊN LIỆU - REPOSITORY =====
 * Thao tác SQL trực tiếp với bảng nguyenlieu, phieunhap, chitiet_phieunhap
 * ========================================= */
const db = require("../config/database");

const NguyenLieuRepository = {
  // 📥 Nhập hàng vào kho (Xử lý phiếu nhập + Tự động bóc tách quy đổi theo danh mục)
  importGoods: async (data) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Chèn thông tin tổng quan hóa đơn vào bảng `phieunhap`
      // Lưu giờ UTC để MySQL không bị lệch múi giờ, trình duyệt tự chuyển về giờ VN
      const utcStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      // Nếu có ngày từ form thì chuyển ngày đó thành UTC (0h VN = 17h UTC-1)
      const ngayNhapStr = data.ngay_nhap
        ? new Date(data.ngay_nhap + 'T00:00:00+07:00').toISOString().replace('T', ' ').slice(0, 19)
        : utcStr;

      const [resPhieu] = await conn.execute(
        "INSERT INTO phieunhap (tong_tien, nha_cung_cap, ghi_chu, ngay_nhap) VALUES (?, ?, ?, ?)",
        [
          parseFloat(data.tong_tien || 0),
          data.nha_cung_cap?.trim() || "Đại lý tự do",
          data.ghi_chu?.trim() || "Nhập kho hệ thống",
          ngayNhapStr
        ]
      );
      const ma_phieu = resPhieu.insertId;

      // 2. Vòng lặp bóc tách chi tiết hàng nhập
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          const cleanVolume = parseFloat(item.so_luong || 0);
          const cleanPrice = parseFloat(item.gia_nhap || 0);
          const cleanId = parseInt(item.ma_nguyen_lieu, 10);

          await conn.execute(
            "INSERT INTO chitiet_phieunhap (ma_phieu, ma_nguyen_lieu, so_luong_nhap, gia_nhap) VALUES (?, ?, ?, ?)",
            [ma_phieu, cleanId, cleanVolume, cleanPrice]
          );

          // CẬP NHẬT TỒN: Nếu là Pha chế hoặc Hết trong ngày (nhập kg quy đổi g) thì nhân dung_tich_san_pham. Còn lại cộng trực tiếp cái/chai/lon.
          await conn.execute(
            `UPDATE nguyenlieu 
             SET ton_kho = ton_kho + IF(danh_muc IN ('Nguyên liệu pha chế', 'Nguyên liệu hết trong ngày'), ( ? * dung_tich_san_pham ), ?) 
             WHERE ma_nguyen_lieu = ?`,
            [cleanVolume, cleanVolume, cleanId]
          );
        }
      }

      await conn.commit();
      return { ma_phieu };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  getImportHistory: async () => {
    const sql = `
      SELECT 
        pn.ma_phieu, 
        pn.ngay_nhap, 
        COALESCE(NULLIF(TRIM(pn.nha_cung_cap), ''), 'Đại lý tự do') AS nha_cung_cap, 
        pn.tong_tien,
        pn.ghi_chu,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'ten_nguyen_lieu', nl.ten_nguyen_lieu,
            'so_luong', ct.so_luong_nhap,
            'gia_nhap', ct.gia_nhap,
            'don_vi_tinh', IF(nl.danh_muc IN ('Nguyên liệu pha chế', 'Nguyên liệu hết trong ngày'), nl.don_vi_tinh, nl.don_vi_nhap),
            'don_vi_nhap', nl.don_vi_nhap
          )
        ) as chi_tiet_hang
      FROM phieunhap pn
      LEFT JOIN chitiet_phieunhap ct ON pn.ma_phieu = ct.ma_phieu
      LEFT JOIN nguyenlieu nl ON ct.ma_nguyen_lieu = nl.ma_nguyen_lieu
      GROUP BY pn.ma_phieu
      ORDER BY pn.ma_phieu DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  getStats: async () => {
    const [day] = await db.execute(`SELECT COALESCE(SUM(tong_tien), 0) as total FROM phieunhap WHERE DATE(ngay_nhap + INTERVAL 7 HOUR) = DATE(NOW() + INTERVAL 7 HOUR)`);
    const [week] = await db.execute(`SELECT COALESCE(SUM(tong_tien), 0) as total FROM phieunhap WHERE YEARWEEK(ngay_nhap + INTERVAL 7 HOUR, 1) = YEARWEEK(NOW() + INTERVAL 7 HOUR, 1)`);
    const [month] = await db.execute(`SELECT COALESCE(SUM(tong_tien), 0) as total FROM phieunhap WHERE MONTH(ngay_nhap + INTERVAL 7 HOUR) = MONTH(NOW() + INTERVAL 7 HOUR) AND YEAR(ngay_nhap + INTERVAL 7 HOUR) = YEAR(NOW() + INTERVAL 7 HOUR)`);
    const [year] = await db.execute(`SELECT COALESCE(SUM(tong_tien), 0) as total FROM phieunhap WHERE YEAR(ngay_nhap + INTERVAL 7 HOUR) = YEAR(NOW() + INTERVAL 7 HOUR)`);

    return {
      day: Number(day[0].total),
      week: Number(week[0].total),
      month: Number(month[0].total),
      year: Number(year[0].total),
    };
  },

  getCategories: async () => {
    const sql = `SELECT DISTINCT COALESCE(danh_muc, 'Nguyên liệu pha chế') AS danh_muc FROM nguyenlieu WHERE danh_muc IS NOT NULL AND danh_muc != '' ORDER BY danh_muc ASC`;
    const [rows] = await db.execute(sql);
    return rows.map((r) => r.danh_muc);
  },

  // ⚡ TỰ ĐỘNG RESET: Nhóm 'Nguyên liệu hết trong ngày' tự động reset về 0 nếu phát hiện bước sang ngày mới (so sánh theo giờ VN UTC+7)
  getAll: async () => {
    const conn = await db.getConnection();
    try {
      await conn.execute(
        `UPDATE nguyenlieu 
         SET ton_kho = 0.00 
         WHERE danh_muc = 'Nguyên liệu hết trong ngày' 
           AND ma_nguyen_lieu IN (
             SELECT DISTINCT ct.ma_nguyen_lieu 
             FROM chitiet_phieunhap ct
             JOIN phieunhap p ON ct.ma_phieu = p.ma_phieu
             WHERE DATE(p.ngay_nhap + INTERVAL 7 HOUR) < DATE(NOW() + INTERVAL 7 HOUR)
           )`
      );

      const sql = `
        SELECT 
          ma_nguyen_lieu, ten_nguyen_lieu,
          COALESCE(danh_muc, 'Nguyên liệu pha chế') AS danh_muc,
          don_vi_tinh, don_vi_nhap, COALESCE(don_vi_dong_goi, '') AS don_vi_dong_goi,
          CAST(dung_tich_san_pham AS DECIMAL(10,2)) AS dung_tich_san_pham, 
          CAST(ton_kho AS DECIMAL(10,2)) AS ton_kho, 
          CAST(nguong_canh_bao AS DECIMAL(10,2)) AS nguong_canh_bao,
          COALESCE(ghi_chu, '') AS ghi_chu,
          COALESCE(trang_thai, 1) AS trang_thai
        FROM nguyenlieu 
        ORDER BY ten_nguyen_lieu ASC
      `;
      const [rows] = await conn.execute(sql);
      return rows;
    } finally {
      conn.release();
    }
  },

  create: async (data) => {
    const ten_nguyen_lieu = data.ten_nguyen_lieu ? String(data.ten_nguyen_lieu).trim() : '';
    const danh_muc = data.danh_muc ? String(data.danh_muc).trim() : 'Nguyên liệu pha chế';
    const don_vi_tinh = data.don_vi_tinh || 'g';
    const don_vi_nhap = data.don_vi_nhap || 'kg';
    const don_vi_dong_goi = data.don_vi_dong_goi ? String(data.don_vi_dong_goi).trim() : null;
    const dung_tich_san_pham = parseFloat(data.dung_tich_san_pham) || 1.00;
    const nguong_canh_bao = parseFloat(data.nguong_canh_bao) || 0.00;
    const ghi_chu = data.ghi_chu ? String(data.ghi_chu).trim() : null;

    const [result] = await db.execute(
      `INSERT INTO nguyenlieu (ten_nguyen_lieu, danh_muc, don_vi_tinh, don_vi_nhap, don_vi_dong_goi, dung_tich_san_pham, ton_kho, nguong_canh_bao, ghi_chu, trang_thai) VALUES (?, ?, ?, ?, ?, ?, 0.00, ?, ?, 1)`,
      [ten_nguyen_lieu, danh_muc, don_vi_tinh, don_vi_nhap, don_vi_dong_goi, dung_tich_san_pham, nguong_canh_bao, ghi_chu]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const ten_nguyen_lieu = data.ten_nguyen_lieu ? String(data.ten_nguyen_lieu).trim() : '';
    const danh_muc = data.danh_muc ? String(data.danh_muc).trim() : 'Nguyên liệu pha chế';
    const don_vi_tinh = data.don_vi_tinh || 'g';
    const don_vi_nhap = data.don_vi_nhap || 'kg';
    const don_vi_dong_goi = data.don_vi_dong_goi ? String(data.don_vi_dong_goi).trim() : null;
    const dung_tich_san_pham = parseFloat(data.dung_tich_san_pham) || 1.00;
    const nguong_canh_bao = parseFloat(data.nguong_canh_bao) || 0.00;
    const ghi_chu = data.ghi_chu ? String(data.ghi_chu).trim() : null;
    const cleanId = parseInt(id, 10);

    const [result] = await db.execute(
      `UPDATE nguyenlieu SET ten_nguyen_lieu = ?, danh_muc = ?, don_vi_tinh = ?, don_vi_nhap = ?, don_vi_dong_goi = ?, dung_tich_san_pham = ?, nguong_canh_bao = ?, ghi_chu = ? WHERE ma_nguyen_lieu = ?`,
      [ten_nguyen_lieu, danh_muc, don_vi_tinh, don_vi_nhap, don_vi_dong_goi, dung_tich_san_pham, nguong_canh_bao, ghi_chu, cleanId]
    );
    return result.affectedRows > 0;
  },

  setStatus: async (id, trang_thai) => {
    const [result] = await db.execute("UPDATE nguyenlieu SET trang_thai = ? WHERE ma_nguyen_lieu = ?", [trang_thai ? 1 : 0, parseInt(id, 10)]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.execute("DELETE FROM nguyenlieu WHERE ma_nguyen_lieu = ?", [parseInt(id, 10)]);
    return result.affectedRows > 0;
  },
};

module.exports = NguyenLieuRepository;