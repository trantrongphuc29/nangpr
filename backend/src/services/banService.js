const banRepository = require("../repositories/banRepository");

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

module.exports = {
  getList,
  create,
  update,
  remove,
};