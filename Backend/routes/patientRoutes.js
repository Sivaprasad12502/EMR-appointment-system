const express = require("express");
const patientRouter = express.Router();
const protect = require("../middlewares/autMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const {
  searchPatients,
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientAppointments,
} = require("../controllers/patientController");

patientRouter.get(
  "/search",
  protect,
  authorizeRoles("super_admin", "doctor", "receptionist"),
  searchPatients,
);

patientRouter.get(
  "/",
  protect,
  authorizeRoles("super_admin", "doctor", "receptionist"),
  getAllPatients,
);
patientRouter.get("/:id", protect, getPatientById);
patientRouter.post(
  "/",
  protect,
  authorizeRoles("super_admin", "receptionist"),
  createPatient,
);
patientRouter.put(
  "/:id",
  protect,
  authorizeRoles("super_admin", "receptionist"),
  updatePatient,
);
patientRouter.delete(
  "/:id",
  protect,
  authorizeRoles("super_admin"),
  deletePatient,
);

patientRouter.get("/:id/appointments", protect, getPatientAppointments);

module.exports = patientRouter;
