const NguyenLieuRepository = require("../repositories/nguyenlieuRepository");

function enrichNguyenLieu(row) {
  const ton = Number(row.ml_thuc_te_ton || 0);
  const nguong = Number(row.nguong_canh_bao || 0);
  let trang_thai_ton = "con_hang";
  if (ton <= 0) trang_thai_ton = "het_hang";
  else if (ton <= nguong) trang_thai_ton = "sap_het";

  return {
    ...row,
    so_luong_ton: ton,
    trang_thai_ton,
  };
}

const NguyenLieuService = {
  getDanhSach: async () => {
    const rows = await NguyenLieuRepository.getAll();
    return rows.map(enrichNguyenLieu);
  },

  getDanhMuc: async () => NguyenLieuRepository.getCategories(),

  nhapKho: async (data) => {
    if (!data.items?.length) throw new Error("Chưa chọn nguyên liệu nhập kho.");
    for (const item of data.items) {
      if (!item.ma_nguyen_lieu) throw new Error("Chưa chọn nguyên liệu.");
      if (Number(item.so_luong) <= 0) throw new Error("Số lượng nhập phải lớn hơn 0.");
      if (Number(item.gia_nhap) < 0) throw new Error("Giá nhập không hợp lệ.");
    }
    const tongTien = data.items.reduce(
      (sum, item) => sum + Number(item.so_luong) * Number(item.gia_nhap),
      0
    );
    return await NguyenLieuRepository.importGoods({
      ...data,
      tong_tien: tongTien,
    });
  },

  getLichSu: async () => NguyenLieuRepository.getImportHistory(),

  getChiPhiStats: async () => NguyenLieuRepository.getStats(),

  themMoi: async (data) => {
    if (!data.ten_nguyen_lieu?.trim()) throw new Error("Tên nguyên liệu không được để trống.");
    if (Number(data.nguong_canh_bao) < 0) throw new Error("Ngưỡng cảnh báo phải >= 0.");
    return await NguyenLieuRepository.create(data);
  },

  capNhat: async (id, data) => {
    if (!data.ten_nguyen_lieu?.trim()) throw new Error("Tên nguyên liệu không được để trống.");
    if (Number(data.nguong_canh_bao) < 0) throw new Error("Ngưỡng cảnh báo phải >= 0.");
    return await NguyenLieuRepository.update(id, data);
  },

  doiTrangThai: async (id, trang_thai) =>
    NguyenLieuRepository.setStatus(id, trang_thai),

  xoa: async (id) => NguyenLieuRepository.delete(id),
};

module.exports = NguyenLieuService;
