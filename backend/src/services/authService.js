const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/authRepository");
const { SECRET_KEY } = require("../config/constants");

const login = (username, password, callback) => {
  authRepository.findAdminByUsername(username, async (err, result) => {
    if (err) return callback({ status: 500, body: { message: "Lỗi server" } });
    if (!result.length) return callback({ status: 400, body: { message: "Sai tài khoản" } });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.mat_khau);
    if (!isMatch) return callback({ status: 400, body: { message: "Sai mật khẩu" } });

    const token = jwt.sign(
      { id: user.ma_admin, username: user.ten_dang_nhap },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return callback(null, { token });
  });
};

module.exports = {
  login,
};
