const express = require("express");
const doctorRouter = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorSchedule,
  updateDoctorSchedule,
  getDoctorSlots,
  getDepartments,
} = require("../controllers/doctorController");
const protect = require("../middlewares/autMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

doctorRouter.get("/departments", protect, getDepartments);
doctorRouter.get("/", protect, getAllDoctors);
doctorRouter.get("/:id", protect, getDoctorById);
doctorRouter.get("/:id/schedule", protect, getDoctorSchedule);
doctorRouter.get("/:id/slots", protect, getDoctorSlots);

doctorRouter.put("/:id", protect, authorizeRoles("super_admin"), updateDoctor);
doctorRouter.put(
  "/:id/schedule",
  protect,
  authorizeRoles("super_admin", "doctor"),
  updateDoctorSchedule,
);

doctorRouter.delete(
  "/:id",
  protect,
  authorizeRoles("super_admin"),
  deleteDoctor,
);

module.exports = doctorRouter;
