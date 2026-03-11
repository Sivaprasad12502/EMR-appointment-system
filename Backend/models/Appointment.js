const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient is required"],
      index: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
      index: true,
    },
    slot: {
      type: String,
      required: [true, "Slot time is required"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Slot must be in HH:MM format",
      ],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["scheduled", "arrived", "completed", "cancelled"],
        message: "{VALUE} is not a valid status",
      },
      default: "scheduled",
      required: true,
    },
    purpose: {
      type: String,
      trim: true,
      maxlength: [500, "Purpose cannot exceed 500 characters"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    arrivedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

appointmentSchema.index(
  { doctor: 1, date: 1, slot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: "cancelled" } },
  },
);

appointmentSchema.index({ doctor: 1, date: 1, status: 1 });
appointmentSchema.index({ patient: 1, status: 1 });
appointmentSchema.index({ status: 1, date: 1 });
appointmentSchema.index({ createdAt: -1 });

appointmentSchema.pre("save", function () {
  if (this.isModified("status")) {
    switch (this.status) {
      case "arrived":
        if (!this.arrivedAt) this.arrivedAt = new Date();
        break;
      case "completed":
        if (!this.completedAt) this.completedAt = new Date();
        break;
      case "cancelled":
        if (!this.cancelledAt) this.cancelledAt = new Date();
        break;
    }
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);
