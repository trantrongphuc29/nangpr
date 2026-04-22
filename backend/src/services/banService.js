const banRepository = require("../repositories/banRepository");

const getList = (sort, callback) => {
  banRepository.getAll(sort, callback);
};

const create = (ten_ban, callback) => {
  if (!ten_ban || ten_ban.trim() === "") {
    return callback({ status: 400, body: { message: "Tên bàn không được để trống" } });
  }
  return banRepository.create(ten_ban.trim(), callback);
};

const update = (id, ten_ban, callback) => {
  if (!ten_ban || ten_ban.trim() === "") {
    return callback({ status: 400, body: { message: "Tên bàn không được để trống" } });
  }
  return banRepository.updateById(id, ten_ban.trim(), callback);
};

const remove = (id, callback) => {
  banRepository.removeById(id, callback);
};

module.exports = {
  getList,
  create,
  update,
  remove,
};
