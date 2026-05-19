const db = require("../config/database");

const MonRepository = {
  // 📊 Lấy danh sách món + tự động ước lượng số ly dựa trên điểm nghẽn vật tư kho
 getAllWithEstimation: async () => {
    const sql = `
      SELECT 
        m.ma_mon, 
        m.ma_danh_muc,
        m.ten_mon, 
        m.gia_ban, 
        m.hinh_anh, 
        m.trang_thai_ban, 
        dm.ten_danh_muc,
        COUNT(ct.ma_nguyen_lieu) AS so_luong_nguyen_lieu,
        IF(COUNT(ct.ma_nguyen_lieu) > 0, 
           IFNULL(FLOOR(MIN(nl.ml_thuc_te_ton / ct.dinh_luong)), 0), 
           0
        ) AS so_luong_co_the_lam,
        -- BIỆN PHÁP CHỐNG CRASH: Nếu không có công thức thì trả về mảng rỗng [] dạng chuỗi chuẩn
        IF(COUNT(ct.ma_nguyen_lieu) > 0,
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'ma_nguyen_lieu', ct.ma_nguyen_lieu,
               'ten_nguyen_lieu', IFNULL(nl.ten_nguyen_lieu, 'Vật tư đã xóa'),
               'dinh_luong', ct.dinh_luong,
               'don_vi_tinh_chi_tiet', ct.don_vi_tinh_chi_tiet
             )
           ),
           '[]'
        ) AS chi_tiet_cong_thuc
      FROM mon m
      LEFT JOIN danhmucmon dm ON m.ma_danh_muc = dm.ma_danh_muc
      LEFT JOIN congthuc ct ON m.ma_mon = ct.ma_mon
      LEFT JOIN nguyenlieu nl ON ct.ma_nguyen_lieu = nl.ma_nguyen_lieu
      GROUP BY m.ma_mon
      ORDER BY m.ma_mon DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // ➕ Thêm món mới thuần túy (Không ép buộc truyền kèm mảng công thức)
  createWithFormula: async (monData) => {
    const [result] = await db.execute(
      'INSERT INTO mon (ma_danh_muc, ten_mon, gia_ban, trang_thai_ban, hinh_anh) VALUES (?, ?, ?, ?, ?)',
      [monData.ma_danh_muc || null, monData.ten_mon, monData.gia_ban, monData.trang_thai_ban || 1, monData.hinh_anh || null]
    );
    return result.insertId;
  },

  // 📝 Cập nhật thông tin cơ bản của món uống hoặc lưu công thức riêng biệt
  updateWithFormula: async (id, monData) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Cập nhật bảng `mon`
      await conn.execute(
        'UPDATE mon SET ma_danh_muc = ?, ten_mon = ?, gia_ban = ?, trang_thai_ban = ? WHERE ma_mon = ?',
        [monData.ma_danh_muc, monData.ten_mon, monData.gia_ban, monData.trang_thai_ban, id]
      );

      // 2. Chỉ ghi lại công thức nếu trong payload gửi lên có chứa mảng công thức (Tránh ghi đè trống)
      if (monData.cong_thuc) {
        await conn.execute('DELETE FROM congthuc WHERE ma_mon = ?', [id]);
        if (monData.cong_thuc.length > 0) {
          for (const item of monData.cong_thuc) {
            await conn.execute(
              'INSERT INTO congthuc (ma_mon, ma_nguyen_lieu, dinh_luong, don_vi_tinh_chi_tiet) VALUES (?, ?, ?, ?)',
              [id, item.ma_nguyen_lieu, item.dinh_luong, item.don_vi_tinh_chi_tiet]
            );
          }
        }
      }

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM mon WHERE ma_mon = ?', [id]);
    return result.affectedRows > 0;
  },

  getCategories: async () => {
    const [rows] = await db.execute('SELECT * FROM danhmucmon ORDER BY ma_danh_muc ASC');
    return rows;
  },

  deductStockByOrder: async (ma_mon, so_luong_ban) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [formulaItems] = await conn.execute('SELECT ma_nguyen_lieu, dinh_luong FROM congthuc WHERE ma_mon = ?', [ma_mon]);
      for (const item of formulaItems) {
        const totalDeduct = item.dinh_luong * so_luong_ban;
        await conn.execute(`UPDATE nguyenlieu SET ml_thuc_te_ton = ml_thuc_te_ton - ? WHERE ma_nguyen_lieu = ?`, [totalDeduct, item.ma_nguyen_lieu]);
      }
      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
};

module.exports = MonRepository;