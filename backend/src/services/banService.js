/* ===== 🪑 BÁN HÀNG - BÀN - SERVICE =====
 * Xử lý nghiệp vụ quản lý bàn (CRUD) + danh sách POS
 * Liên kết: banController → banService → banRepository
 * ======================================= */
const banRepository = require("../repositories/banRepository");
const DonHangRepository = require("../repositories/donHangRepository");

const getList = async (sort) => await banRepository.getAll(sort);

const create = async (ten_ban) => {
  if (!ten_ban || ten_ban.trim() === "") {
    throw { status: 400, message: "Tên bàn không được để trống" };
  }
  return await banRepository.create(ten_ban.trim());
};

const update = async (id, ten_ban) => {
  if (!ten_ban || ten_ban.trim() === "") {
    throw { status: 400, message: "Tên bàn không được để trống" };
  }
  return await banRepository.updateById(id, ten_ban.trim());
};

const remove = async (id) => await banRepository.removeById(id);

/** POS: lấy danh sách bàn kèm trạng thái đơn */
const getPosList = async () => DonHangRepository.getBanPosList();

module.exports = {
  getList,
  create,
  update,
  remove,
  getPosList,
};