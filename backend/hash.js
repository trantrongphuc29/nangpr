const bcrypt = require("bcryptjs");

const password = "123456"; 
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log("Mật khẩu gốc:", password);
    console.log("Chuỗi đã mã hóa (Copy cái này vào DB):", hash);
});