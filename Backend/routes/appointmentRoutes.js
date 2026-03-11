const express = require("express");
const appointmentRouter = express.Router();
const protect = require("../middlewares/autMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  markAsArrived,
  getAppointmentStats,
} = require("../controllers/appointementConroller");

appointmentRouter.get(
  "/stats",
  protect,
  authorizeRoles("super_admin", "doctor", "receptionist"),
  getAppointmentStats,
);
appointmentRouter.get("/", protect, getAppointments);
appointmentRouter.get("/:id", protect, getAppointmentById);

appointmentRouter.post(
  "/",
  protect,
  authorizeRoles("receptionist", "patient"),
  bookAppointment,
);

appointmentRouter.put(
  "/:id",
  protect,
  authorizeRoles("super_admin", "receptionist", "doctor"),
  updateAppointment,
);
appointmentRouter.post(
  "/:id/arrive",
  protect,
  authorizeRoles("receptionist", "doctor"),
  markAsArrived,
);

appointmentRouter.delete(
  "/:id",
  protect,
  authorizeRoles("super_admin", "receptionist"),
  deleteAppointment,
);

module.exports = appointmentRouter;
