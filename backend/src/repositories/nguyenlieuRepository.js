const db = require("../config/database");

const NguyenLieuRepository = {
  importGoods: async (data) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const ngayNhap = data.ngay_nhap || new Date();
      const [resPhieu] = await conn.execute(
        "INSERT INTO phieunhap (tong_tien, nha_cung_cap, ghi_chu, ngay_nhap) VALUES (?, ?, ?, ?)",
        [data.tong_tien, data.nha_cung_cap || "Đại lý tự do", data.ghi_chu || null, ngayNhap]
      );
      const ma_phieu = resPhieu.insertId;

      for (const item of data.items) {
        await conn.execute(
          "INSERT INTO chitiet_phieunhap (ma_phieu, ma_nguyen_lieu, so_luong_nhap, gia_nhap) VALUES (?, ?, ?, ?)",
          [ma_phieu, item.ma_nguyen_lieu, item.so_luong, item.gia_nhap]
        );

        await conn.execute(
          `UPDATE nguyenlieu 
           SET ml_thuc_te_ton = ml_thuc_te_ton + ( ? * dung_tich_san_pham ) 
           WHERE ma_nguyen_lieu = ?`,
          [item.so_luong, item.ma_nguyen_lieu]
        );
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
        pn.nha_cung_cap, 
        pn.tong_tien,
        pn.ghi_chu,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'ten_nguyen_lieu', nl.ten_nguyen_lieu,
            'so_luong', ct.so_luong_nhap,
            'gia_nhap', ct.gia_nhap,
            'don_vi_tinh', nl.don_vi_nhap
          )
        ) as chi_tiet_hang
      FROM phieunhap pn
      LEFT JOIN chitiet_phieunhap ct ON pn.ma_phieu = ct.ma_phieu
      LEFT JOIN nguyenlieu nl ON ct.ma_nguyen_lieu = nl.ma_nguyen_lieu
      GROUP BY pn.ma_phieu
      ORDER BY pn.ngay_nhap DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  getStats: async () => {
    const [day] = await db.execute(
      `SELECT COALESCE(SUM(tong_tien), 0) as total FROM phieunhap WHERE DATE(ngay_nhap) = CURDATE()`
    );
    const [week] = await db.execute(
      `SELECT COALESCE(SUM(tong_tien), 0) as total FROM phieunhap WHERE YEARWEEK(ngay_nhap, 1) = YEARWEEK(CURDATE(), 1)`
    );
    const [month] = await db.execute(
      `SELECT COALESCE(SUM(tong_tien), 0) as total FROM phieunhap WHERE MONTH(ngay_nhap) = MONTH(CURDATE()) AND YEAR(ngay_nhap) = YEAR(CURDATE())`
    );
    const [year] = await db.execute(
      `SELECT COALESCE(SUM(tong_tien), 0) as total FROM phieunhap WHERE YEAR(ngay_nhap) = YEAR(CURDATE())`
    );

    return {
      day: Number(day[0].total),
      week: Number(week[0].total),
      month: Number(month[0].total),
      year: Number(year[0].total),
    };
  },

  getCategories: async () => {
    const [rows] = await db.execute(
      `SELECT DISTINCT COALESCE(danh_muc, 'Khác') AS danh_muc 
       FROM nguyenlieu 
       WHERE danh_muc IS NOT NULL AND danh_muc != ''
       ORDER BY danh_muc ASC`
    );
    return rows.map((r) => r.danh_muc);
  },

  getAll: async () => {
    const [rows] = await db.execute(
      `SELECT 
        ma_nguyen_lieu, ten_nguyen_lieu,
        COALESCE(danh_muc, 'Khác') AS danh_muc,
        COALESCE(don_vi_tinh, IF(don_vi_nhap = 'kg', 'g', 'ml')) AS don_vi_tinh,
        don_vi_nhap, COALESCE(don_vi_dong_goi, '') AS don_vi_dong_goi,
        dung_tich_san_pham, ml_thuc_te_ton, nguong_canh_bao,
        COALESCE(ghi_chu, '') AS ghi_chu,
        COALESCE(trang_thai, 1) AS trang_thai
      FROM nguyenlieu 
      ORDER BY ten_nguyen_lieu ASC`
    );
    return rows;
  },

  create: async (data) => {
    const {
      ten_nguyen_lieu,
      danh_muc = "Khác",
      don_vi_tinh = "g",
      don_vi_nhap,
      don_vi_dong_goi = null,
      dung_tich_san_pham,
      nguong_canh_bao,
      ghi_chu = null,
    } = data;
    const [result] = await db.execute(
      `INSERT INTO nguyenlieu 
        (ten_nguyen_lieu, danh_muc, don_vi_tinh, don_vi_nhap, don_vi_dong_goi, dung_tich_san_pham, ml_thuc_te_ton, nguong_canh_bao, ghi_chu, trang_thai) 
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 1)`,
      [
        ten_nguyen_lieu,
        danh_muc,
        don_vi_tinh,
        don_vi_nhap,
        don_vi_dong_goi,
        parseFloat(dung_tich_san_pham),
        parseFloat(nguong_canh_bao),
        ghi_chu,
      ]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const {
      ten_nguyen_lieu,
      danh_muc,
      don_vi_tinh,
      don_vi_nhap,
      don_vi_dong_goi,
      dung_tich_san_pham,
      nguong_canh_bao,
      ghi_chu,
    } = data;
    const [result] = await db.execute(
      `UPDATE nguyenlieu 
      SET ten_nguyen_lieu = ?, danh_muc = ?, don_vi_tinh = ?, don_vi_nhap = ?, 
          don_vi_dong_goi = ?, dung_tich_san_pham = ?, nguong_canh_bao = ?, ghi_chu = ?
      WHERE ma_nguyen_lieu = ?`,
      [
        ten_nguyen_lieu,
        danh_muc,
        don_vi_tinh,
        don_vi_nhap,
        don_vi_dong_goi,
        parseFloat(dung_tich_san_pham),
        parseFloat(nguong_canh_bao),
        ghi_chu,
        parseInt(id),
      ]
    );
    return result.affectedRows > 0;
  },

  setStatus: async (id, trang_thai) => {
    const [result] = await db.execute(
      "UPDATE nguyenlieu SET trang_thai = ? WHERE ma_nguyen_lieu = ?",
      [trang_thai ? 1 : 0, parseInt(id)]
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.execute("DELETE FROM nguyenlieu WHERE ma_nguyen_lieu = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = NguyenLieuRepository;
