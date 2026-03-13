const express = require("express");
const authRouter = express.Router();
const {
  registerPatient,
  login,
  refreshToken,
  getMe,
  logout,
} = require("../controllers/authControlles");
const protect = require("../middlewares/autMiddleware");

authRouter.post("/register", registerPatient);
authRouter.post("/login", login);
authRouter.post("/logout",protect, logout);
authRouter.post("/refresh-token", refreshToken);

authRouter.get("/me", protect, getMe);

module.exports = authRouter;
