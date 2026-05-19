const NguyenLieuRepository = require('../repositories/nguyenlieuRepository');

const NguyenLieuService = {
  getDanhSach: async () => {
    return await NguyenLieuRepository.getAll();
  },
  nhapKho: async (data) => {
    if (!data.items || data.items.length === 0) throw new Error("Danh sách trống!");
    const tongTien = data.items.reduce((sum, item) => sum + (item.so_luong * item.gia_nhap), 0);
    return await NguyenLieuRepository.importGoods({ ...data, tong_tien: tongTien });
  },
  getLichSu: async () => {
    return await NguyenLieuRepository.getImportHistory();
  },
  getChiPhiStats: async () => {
    return await NguyenLieuRepository.getStats();
  },
  themMoi: async (data) => { return await NguyenLieuRepository.create(data); },
  
  capNhat: async (id, data) => { 
    return await NguyenLieuRepository.update(id, data); 
  },
  
  xoa: async (id) => { return await NguyenLieuRepository.delete(id); }
};

module.exports = NguyenLieuService;