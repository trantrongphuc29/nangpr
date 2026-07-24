/* =====   BÀN  =====
 * Xử lý nghiệp vụ quản lý bàn (CRUD) + danh sách POS
 * Liên kết: banController → banService → banRepository
 * ======================================= */
const banRepository = require("../repositories/banRepository");
const DonHangRepository = require("../repositories/donHangRepository");

const getList = async (sort) => await banRepository.getAll(sort);

const normalizeTenBan = (str) => str.trim().replace(/\s+/g, ' ');

const create = async (ten_ban) => {
  if (!ten_ban || ten_ban.trim() === "") {
    throw { status: 400, message: "Tên bàn không được để trống" };
  }
  const trimmed = normalizeTenBan(ten_ban);

  // Kiểm tra trùng tên bàn
  const existing = await banRepository.findByName(trimmed);
  if (existing) {
    throw { status: 400, message: `Tên bàn "${trimmed}" đã tồn tại. Vui lòng chọn tên khác.` };
  }

  return await banRepository.create(trimmed);
};

const update = async (id, ten_ban) => {
  if (!ten_ban || ten_ban.trim() === "") {
    throw { status: 400, message: "Tên bàn không được để trống" };
  }
  const trimmed = normalizeTenBan(ten_ban);

  // Kiểm tra trùng tên bàn (loại trừ bàn hiện tại)
  const existing = await banRepository.findByName(trimmed, id);
  if (existing) {
    throw { status: 400, message: `Tên bàn "${trimmed}" đã tồn tại. Vui lòng chọn tên khác.` };
  }

  return await banRepository.updateById(id, trimmed);
};

const remove = async (id) => {
  // Không cho xóa bàn đang phục vụ (còn đơn hàng chưa thanh toán)
  if (await banRepository.hasActiveOrder(id)) {
    throw {
      status: 409,
      message: "Bàn đang phục vụ, không thể xóa. Vui lòng thanh toán hoặc hủy đơn trước.",
    };
  }
  return await banRepository.removeById(id);
};

/** POS: lấy danh sách bàn kèm trạng thái đơn */
const getPosList = async () => DonHangRepository.getBanPosList();

module.exports = {
  getList,
  create,
  update,
  remove,
  getPosList,
};