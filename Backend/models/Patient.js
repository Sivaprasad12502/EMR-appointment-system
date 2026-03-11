const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^[0-9]{10,15}$/.test(v);
        },
        message: "Please provide a valid phone number (10-15 digits)",
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [150, "Age cannot exceed 150"],
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "{VALUE} is not a valid gender",
      },
    },
    address: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
    },
    dob: {
      type: Date,
    },
    patientId: {
      type: String,
      unique: true,
      sparse: true,
    },
    medicalHistory: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

patientSchema.index({ phone: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ name: "text" });
patientSchema.index({ patientId: 1 });

patientSchema.pre("save", async function () {
  if (!this.patientId && this.isNew) {
    const count = await mongoose.model("Patient").countDocuments();
    this.patientId = `PAT${String(count + 1).padStart(6, "0")}`;
  }
});

module.exports = mongoose.model("Patient", patientSchema);
