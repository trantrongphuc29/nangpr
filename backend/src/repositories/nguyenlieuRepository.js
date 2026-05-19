const db = require("../config/database");

const NguyenLieuRepository = {
  importGoods: async (data) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [resPhieu] = await conn.execute(
        'INSERT INTO phieunhap (tong_tien, nha_cung_cap, ghi_chu) VALUES (?, ?, ?)',
        [data.tong_tien, data.nha_cung_cap || 'Đại lý tự do', data.ghi_chu]
      );
      const ma_phieu = resPhieu.insertId;

      for (const item of data.items) {
        // Lưu số lượng hộp/chai thực tế nhập vào chi tiết phiếu
        await conn.execute(
          'INSERT INTO chitiet_phieunhap (ma_phieu, ma_nguyen_lieu, so_luong_nhap, gia_nhap) VALUES (?, ?, ?, ?)',
          [ma_phieu, item.ma_nguyen_lieu, item.so_luong, item.gia_nhap]
        );

        // LUỒNG TỰ ĐỘNG: Lấy số lượng nhập nhân với dung tích gốc của sản phẩm để cộng vào ml_thuc_te_ton
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
    const [day] = await db.execute(`SELECT COALESCE(SUM(tong_tien), 0) as total FROM phieunhap WHERE DATE(ngay_nhap) = CURDATE()`);
    const [week] = await db.execute(`SELECT COALESCE(SUM(tong_tien), 0) as total FROM phieunhap WHERE YEARWEEK(ngay_nhap, 1) = YEARWEEK(CURDATE(), 1)`);
    const [month] = await db.execute(`SELECT COALESCE(SUM(tong_tien), 0) as total FROM phieunhap WHERE MONTH(ngay_nhap) = MONTH(CURDATE()) AND YEAR(ngay_nhap) = YEAR(CURDATE())`);
    const [year] = await db.execute(`SELECT COALESCE(SUM(tong_tien), 0) as total FROM phieunhap WHERE YEAR(ngay_nhap) = YEAR(CURDATE())`);
    
    return { day: day[0].total, week: week[0].total, month: month[0].total, year: year[0].total };
  },

  getAll: async () => {
    const [rows] = await db.execute('SELECT * FROM nguyenlieu ORDER BY ma_nguyen_lieu DESC');
    return rows;
  },

  create: async (data) => {
    const { ten_nguyen_lieu, don_vi_nhap, dung_tich_san_pham, nguong_canh_bao } = data;
    const [result] = await db.execute(
      'INSERT INTO nguyenlieu (ten_nguyen_lieu, don_vi_nhap, dung_tich_san_pham, ml_thuc_te_ton, nguong_canh_bao) VALUES (?, ?, ?, 0, ?)',
      [ten_nguyen_lieu, don_vi_nhap, parseFloat(dung_tich_san_pham), parseFloat(nguong_canh_bao)]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const { ten_nguyen_lieu, don_vi_nhap, dung_tich_san_pham, nguong_canh_bao } = data;
    const sql = `
      UPDATE nguyenlieu 
      SET ten_nguyen_lieu = ?, 
          don_vi_nhap = ?, 
          dung_tich_san_pham = ?,
          nguong_canh_bao = ? 
      WHERE ma_nguyen_lieu = ?
    `;
    const [result] = await db.execute(sql, [
      ten_nguyen_lieu, 
      don_vi_nhap, 
      parseFloat(dung_tich_san_pham), 
      parseFloat(nguong_canh_bao), 
      parseInt(id)
    ]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM nguyenlieu WHERE ma_nguyen_lieu = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = NguyenLieuRepository;