const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      required: true,
      enum: ["super_admin", "doctor", "receptionist", "patient"],
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "LOGOUT",
        "CREATE_APPOINTMENT",
        "UPDATE_APPOINTMENT",
        "DELETE_APPOINTMENT",
        "MARK_ARRIVED",
        "CREATE_USER",
        "UPDATE_USER",
        "DELETE_USER",
        "CREATE_DOCTOR",
        "UPDATE_DOCTOR",
        "CREATE_PATIENT",
        "UPDATE_PATIENT",
      ],
    },
    entity: {
      type: String,
      required: true,
      enum: ["User", "Appointment", "Doctor", "Patient", "Auth"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
