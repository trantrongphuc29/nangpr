/* ===== 🍽️ MÓN & CÔNG THỨC - REPOSITORY =====
 * Thao tác SQL với bảng mon, congthuc, danhmucmon, nguyenlieu
 * ============================================= */
const db = require("../config/database");

/** Parse JSON_ARRAYAGG string → array an toàn */
const parseFormulaJSON = (raw) => {
  if (!raw) return [];

  try {
    // mysql2 trả JSON dạng Buffer — cần chuyển về string trước
    let str = raw;
    if (Buffer.isBuffer(str)) {
      str = str.toString("utf8");
    }

    const parsed = typeof str === "string" ? JSON.parse(str) : str;

    return Array.isArray(parsed)
      ? parsed.filter((item) => item && item.ma_nguyen_lieu !== null)
      : [];
  } catch {
    return [];
  }
};

const MonRepository = {
  /** Lấy danh sách món + ước lượng số ly */
  getAllWithEstimation: async () => {
    const sql = `
      SELECT 
        m.ma_mon, 
        m.ma_danh_muc,
        m.ten_mon, 
        m.gia_ban, 
        m.hinh_anh,
        m.mo_ta,
        m.trang_thai_ban, 
        dm.ten_danh_muc,

        COUNT(ct.ma_nguyen_lieu) AS so_luong_nguyen_lieu,

        IF(
          COUNT(ct.ma_nguyen_lieu) > 0, 
          IFNULL(FLOOR(MIN(nl.ton_kho / ct.dinh_luong)), 0), 
          0
        ) AS so_luong_co_the_lam,

        IF(
          COUNT(ct.ma_nguyen_lieu) > 0,
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

    return rows.map((row) => ({
      ...row,
      chi_tiet_cong_thuc: parseFormulaJSON(row.chi_tiet_cong_thuc),
    }));
  },

  /** Lấy công thức của một món */
  getFormulas: async (ma_mon) => {
    const [rows] = await db.execute(
      `SELECT 
          ct.ma_nguyen_lieu, 
          ct.dinh_luong, 
          ct.don_vi_tinh_chi_tiet,
          nl.ten_nguyen_lieu, 
          nl.don_vi_nhap
       FROM congthuc ct
       LEFT JOIN nguyenlieu nl ON ct.ma_nguyen_lieu = nl.ma_nguyen_lieu
       WHERE ct.ma_mon = ?
       ORDER BY ct.ma_nguyen_lieu`,
      [ma_mon]
    );

    return rows;
  },

  /** Ghi đè toàn bộ công thức cho một món */
  saveFormulas: async (ma_mon, formulas) => {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      await conn.execute("DELETE FROM congthuc WHERE ma_mon = ?", [ma_mon]);

      if (formulas && formulas.length > 0) {
        for (const item of formulas) {
          await conn.execute(
            `INSERT INTO congthuc 
             (ma_mon, ma_nguyen_lieu, dinh_luong, don_vi_tinh_chi_tiet) 
             VALUES (?, ?, ?, ?)`,
            [
              ma_mon,
              item.ma_nguyen_lieu,
              item.dinh_luong,
              item.don_vi_tinh_chi_tiet || null,
            ]
          );
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

  /** Tạo món mới */
  create: async (data) => {
    const [result] = await db.execute(
      `INSERT INTO mon 
       (ma_danh_muc, ten_mon, gia_ban, trang_thai_ban, hinh_anh, mo_ta) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.ma_danh_muc || null,
        data.ten_mon,
        data.gia_ban,
        data.trang_thai_ban ?? 1,
        data.hinh_anh || null,
        data.mo_ta || null,
      ]
    );

    return result.insertId;
  },

  /** Cập nhật thông tin món */
  update: async (id, data) => {
    const [result] = await db.execute(
      `UPDATE mon 
       SET ma_danh_muc = ?, 
           ten_mon = ?, 
           gia_ban = ?, 
           trang_thai_ban = ?, 
           hinh_anh = ?,
           mo_ta = ?
       WHERE ma_mon = ?`,
      [
        data.ma_danh_muc || null,
        data.ten_mon,
        data.gia_ban,
        data.trang_thai_ban ?? 1,
        data.hinh_anh || null,
        data.mo_ta || null,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  /** Xóa món */
  delete: async (id) => {
    const [result] = await db.execute(
      "DELETE FROM mon WHERE ma_mon = ?",
      [id]
    );

    return result.affectedRows > 0;
  },

  /** Lấy thông tin một món theo ID */
  getById: async (id) => {
    const [rows] = await db.execute(
      `SELECT * FROM mon WHERE ma_mon = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  /** Lấy danh mục món */
  getCategories: async () => {
    const [rows] = await db.execute(
      "SELECT * FROM danhmucmon ORDER BY ma_danh_muc ASC"
    );

    return rows;
  },

  /** Trừ kho khi bán món */
  deductStockByOrder: async (ma_mon, so_luong_ban) => {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const [formulaItems] = await conn.execute(
        `SELECT ma_nguyen_lieu, dinh_luong 
         FROM congthuc 
         WHERE ma_mon = ?`,
        [ma_mon]
      );

      for (const item of formulaItems) {
        const totalDeduct = item.dinh_luong * so_luong_ban;

        await conn.execute(
          `UPDATE nguyenlieu 
           SET ton_kho = ton_kho - ? 
           WHERE ma_nguyen_lieu = ?`,
          [totalDeduct, item.ma_nguyen_lieu]
        );
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

  /** Kiểm tra nguyên liệu có đủ để bán không */
  assertCanSell: async (ma_mon, so_luong) => {
    const [formulaItems] = await db.execute(
      `SELECT 
          ct.ma_nguyen_lieu, 
          ct.dinh_luong, 
          nl.ton_kho, 
          nl.ten_nguyen_lieu
       FROM congthuc ct
       LEFT JOIN nguyenlieu nl ON ct.ma_nguyen_lieu = nl.ma_nguyen_lieu
       WHERE ct.ma_mon = ?`,
      [ma_mon]
    );

    if (formulaItems.length === 0) return;

    for (const item of formulaItems) {
      const canBo = Number(item.ton_kho || 0);
      const need = Number(item.dinh_luong) * Number(so_luong);

      if (canBo < need) {
        throw new Error(
          `Nguyên liệu "${item.ten_nguyen_lieu}" không đủ (cần ${need}, còn ${Math.max(
            0,
            canBo
          )}). Vui lòng nhập kho trước.`
        );
      }
    }
  },
};

module.exports = MonRepository;