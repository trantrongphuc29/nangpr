const authService = require("../services/authService");

const login = (req, res) => {
  const { username, password } = req.body;
  authService.login(username, password, (error, data) => {
    if (error) return res.status(error.status).json(error.body);
    return res.json(data);
  });
};

module.exports = {
  login,
};
