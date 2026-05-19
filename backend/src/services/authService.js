const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/authRepository");
const { SECRET_KEY } = require("../config/constants");

const login = async (username, password) => {
    // 1. Tìm user
    const result = await authRepository.findAdminByUsername(username);
    
    if (!result || result.length === 0) {
        throw { status: 400, message: "Tài khoản không tồn tại" };
    }

    const user = result[0];

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.mat_khau);
    if (!isMatch) {
        throw { status: 400, message: "Mật khẩu không chính xác" };
    }

    // 3. Tạo Token
    const token = jwt.sign(
        { id: user.ma_admin, username: user.ten_dang_nhap },
        SECRET_KEY || 'your_secret_key', // Đảm bảo có secret key
        { expiresIn: "1d" }
    );

    return { token, username: user.ten_dang_nhap };
};

module.exports = { login };