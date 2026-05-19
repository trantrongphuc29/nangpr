const authService = require("../services/authService");

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const data = await authService.login(username, password);
        return res.json(data);
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(error.status || 500).json({ 
            message: error.message || "Lỗi máy chủ" 
        });
    }
};

module.exports = { login };