const express = require("express");
const userRouter = express.Router();
const {
  createUser,
  getAllusers,
  getUserById,
  deleteUser,
  updateUser,
} = require("../controllers/userController");
const protect = require("../middlewares/autMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

userRouter.post("/", protect, authorizeRoles("super_admin"), createUser);
userRouter.get("/", protect, authorizeRoles("super_admin"), getAllusers);
userRouter.get("/:id", protect, authorizeRoles("super_admin"), getUserById);
userRouter.put("/:id", protect, authorizeRoles("super_admin"), updateUser);
userRouter.delete("/:id", protect, authorizeRoles("super_admin"), deleteUser);

module.exports = userRouter;
