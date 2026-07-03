/* ===== 💰 CÔNG NỢ - REPOSITORY =====
 * Thao tác SQL với bảng phieunhap để theo dõi công nợ nhà cung cấp
 * ================================== */
const db = require("../config/database");

const CongNoRepository = {
  /** Lấy danh sách công nợ (phiếu nhập chưa thanh toán / đã thanh toán) */
  getAll: async ({ trang_thai, nha_cung_cap, search, from_date, to_date, limit = 50, offset = 0 } = {}) => {
    let whereParts = [];
    const params = [];

    if (trang_thai === 'no') {
      whereParts.push('(pn.da_thanh_toan = 0 OR pn.tong_tien > pn.so_tien_da_tra)');
    } else if (trang_thai === 'da_tra') {
      whereParts.push('pn.da_thanh_toan = 1 AND pn.tong_tien <= pn.so_tien_da_tra');
    }

    if (nha_cung_cap) {
      whereParts.push('pn.nha_cung_cap LIKE ?');
      params.push(`%${nha_cung_cap}%`);
    }

    if (search) {
      whereParts.push('(pn.nha_cung_cap LIKE ? OR CAST(pn.ma_phieu AS CHAR) LIKE ? OR CAST(pn.tong_tien AS CHAR) LIKE ? OR pn.ma_phieu IN (SELECT DISTINCT ct.ma_phieu FROM chitiet_phieunhap ct LEFT JOIN nguyenlieu nl ON ct.ma_nguyen_lieu = nl.ma_nguyen_lieu WHERE nl.ten_nguyen_lieu LIKE ?))');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (from_date) {
      whereParts.push('DATE(pn.ngay_nhap + INTERVAL 7 HOUR) >= ?');
      params.push(from_date);
    }

    if (to_date) {
      whereParts.push('DATE(pn.ngay_nhap + INTERVAL 7 HOUR) <= ?');
      params.push(to_date);
    }

    const where = whereParts.length ? 'WHERE ' + whereParts.join(' AND ') : '';

    // Đếm tổng số
    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS cnt FROM phieunhap pn ${where}`,
      params
    );
    const total = Number(countRows[0].cnt);

    // Lấy danh sách
    const [rows] = await db.execute(
      `SELECT 
        pn.ma_phieu,
        pn.ngay_nhap,
        pn.nha_cung_cap,
        pn.tong_tien,
        pn.ghi_chu,
        pn.da_thanh_toan,
        pn.ngay_thanh_toan,
        pn.so_tien_da_tra,
        (pn.tong_tien - pn.so_tien_da_tra) AS con_no,
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'ten_nguyen_lieu', nl.ten_nguyen_lieu,
            'so_luong', ct.so_luong_nhap,
            'gia_nhap', ct.gia_nhap,
            'don_vi_nhap', nl.don_vi_nhap
          )
        ) FROM chitiet_phieunhap ct
        LEFT JOIN nguyenlieu nl ON ct.ma_nguyen_lieu = nl.ma_nguyen_lieu
        WHERE ct.ma_phieu = pn.ma_phieu) AS chi_tiet_hang
      FROM phieunhap pn
      ${where}
      ORDER BY pn.ngay_nhap DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  },

  /** Lấy thống kê công nợ */
  getStats: async ({ from_date, to_date } = {}) => {
    // Tổng công nợ chưa thanh toán
    const [tongNo] = await db.execute(
      `SELECT COALESCE(SUM(pn.tong_tien - pn.so_tien_da_tra), 0) AS tong_con_no,
              COUNT(*) AS so_phieu_no
       FROM phieunhap pn
       WHERE pn.da_thanh_toan = 0 OR pn.tong_tien > pn.so_tien_da_tra`
    );

    // Đã thanh toán trong kỳ (theo from_date/to_date)
    let daTraParams = [];
    let daTraWhere = '';
    if (from_date) {
      daTraWhere += ' AND DATE(pn.ngay_thanh_toan + INTERVAL 7 HOUR) >= ?';
      daTraParams.push(from_date);
    }
    if (to_date) {
      daTraWhere += ' AND DATE(pn.ngay_thanh_toan + INTERVAL 7 HOUR) <= ?';
      daTraParams.push(to_date);
    }
    const [daTraThang] = await db.execute(
      `SELECT COALESCE(SUM(pn.tong_tien), 0) AS da_tra
       FROM phieunhap pn
       WHERE pn.da_thanh_toan = 1 ${daTraWhere}`,
      daTraParams
    );

    // Chi phí nhập trong tháng (tổng tiền nhập) — theo giờ VN
    const [chiThang] = await db.execute(
      `SELECT COALESCE(SUM(pn.tong_tien), 0) AS chi
       FROM phieunhap pn
       WHERE MONTH(pn.ngay_nhap + INTERVAL 7 HOUR) = MONTH(NOW() + INTERVAL 7 HOUR) 
         AND YEAR(pn.ngay_nhap + INTERVAL 7 HOUR) = YEAR(NOW() + INTERVAL 7 HOUR)`
    );

    // Số nhà cung cấp đang có công nợ
    const [nccNo] = await db.execute(
      `SELECT COUNT(DISTINCT pn.nha_cung_cap) AS so_ncc
       FROM phieunhap pn
       WHERE pn.da_thanh_toan = 0 OR pn.tong_tien > pn.so_tien_da_tra`
    );

    // Tổng công nợ theo kỳ (theo from_date/to_date)
    let kyParams = [];
    let kyWhere = '';
    if (from_date) {
      kyWhere += ' AND DATE(pn.ngay_nhap + INTERVAL 7 HOUR) >= ?';
      kyParams.push(from_date);
    }
    if (to_date) {
      kyWhere += ' AND DATE(pn.ngay_nhap + INTERVAL 7 HOUR) <= ?';
      kyParams.push(to_date);
    }
    const [kyNo] = await db.execute(
      `SELECT COALESCE(SUM(pn.tong_tien - pn.so_tien_da_tra), 0) AS tong_con_no_ky
       FROM phieunhap pn
       WHERE (pn.da_thanh_toan = 0 OR pn.tong_tien > pn.so_tien_da_tra) ${kyWhere}`,
      kyParams
    );

    return {
      tong_con_no: Number(tongNo[0].tong_con_no),
      so_phieu_no: Number(tongNo[0].so_phieu_no),
      da_tra_trong_thang: Number(daTraThang[0].da_tra),
      chi_trong_thang: Number(chiThang[0].chi),
      so_ncc_dang_no: Number(nccNo[0].so_ncc),
      tong_con_no_ky: Number(kyNo[0].tong_con_no_ky),
    };
  },

  /** Thanh toán một phần hoặc toàn bộ công nợ */
  pay: async (ma_phieu, so_tien) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Lấy thông tin phiếu
      const [rows] = await conn.execute(
        `SELECT tong_tien, so_tien_da_tra, da_thanh_toan FROM phieunhap WHERE ma_phieu = ?`,
        [ma_phieu]
      );
      if (!rows.length) throw new Error("Phiếu nhập không tồn tại");

      const tongTien = Number(rows[0].tong_tien);
      const soTienDaTra = Number(rows[0].so_tien_da_tra);
      const soTienMoi = soTienDaTra + Number(so_tien);

      if (soTienMoi > tongTien) {
        throw new Error("Số tiền thanh toán vượt quá tổng tiền phiếu nhập");
      }

      const daThanhToan = soTienMoi >= tongTien ? 1 : 0;
      const ngayThanhToan = daThanhToan ? new Date() : null;

      await conn.execute(
        `UPDATE phieunhap SET so_tien_da_tra = ?, da_thanh_toan = ?, ngay_thanh_toan = ? WHERE ma_phieu = ?`,
        [soTienMoi, daThanhToan, ngayThanhToan, ma_phieu]
      );

      await conn.commit();
      return { ma_phieu, so_tien_da_tra: soTienMoi, da_thanh_toan: daThanhToan, con_no: tongTien - soTienMoi };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  /** Thanh toán tất cả công nợ đang nợ */
  payAll: async () => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Lấy tất cả phiếu đang nợ
      const [rows] = await conn.execute(
        `SELECT ma_phieu, tong_tien, so_tien_da_tra FROM phieunhap WHERE da_thanh_toan = 0 OR tong_tien > so_tien_da_tra`
      );

      if (!rows.length) {
        throw new Error("Không có công nợ nào cần thanh toán");
      }

      let tongDaTra = 0;
      let soPhieu = 0;

      for (const phieu of rows) {
        const conNo = Number(phieu.tong_tien) - Number(phieu.so_tien_da_tra);
        if (conNo <= 0) continue;
        const soTienMoi = Number(phieu.tong_tien); // thanh toán hết
        await conn.execute(
          `UPDATE phieunhap SET so_tien_da_tra = ?, da_thanh_toan = 1, ngay_thanh_toan = NOW() WHERE ma_phieu = ?`,
          [soTienMoi, phieu.ma_phieu]
        );
        tongDaTra += conNo;
        soPhieu++;
      }

      await conn.commit();
      return { so_phieu: soPhieu, tong_tien: tongDaTra };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },
};

module.exports = CongNoRepository;
