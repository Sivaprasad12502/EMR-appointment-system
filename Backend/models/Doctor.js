const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      min: 0,
    },
    schedule: [
      {
        day: {
          type: String,
          enum: [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ],
          required: true,
        },
        start: {
          type: String,
          required: true,
          match: [
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Invalid time format. Use HH:MM",
          ],
        },
        end: {
          type: String,
          required: true,
          match: [
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Invalid time format. Use HH:MM",
          ],
        },
        breaks: [
          {
            start: {
              type: String,
              match: [
                /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                "Invalid time format. Use HH:MM",
              ],
            },
            end: {
              type: String,
              match: [
                /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                "Invalid time format. Use HH:MM",
              ],
            },
          },
        ],
      },
    ],
    slotDuration: {
      type: Number,
      required: true,
      default: 15,
      min: [5, "Slot duration must be at least 5 minutes"],
      max: [120, "Slot duration cannot exceed 120 minutes"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

doctorSchema.index({ user: 1 });
doctorSchema.index({ department: 1, isActive: 1 });
doctorSchema.index({ isActive: 1 });

doctorSchema.virtual("userDetails", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Doctor", doctorSchema);
