const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const generateSlots = require("../utils/generateSlots");
const { createAuditLog } = require("../utils/auditLogger");
const {
  validateAppointmentData,
  validatePatientData,
  isValidObjectId,
  isPastDateTime,
} = require("../utils/validator");

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, patientData, date, slot, purpose, notes } =
      req.body;

    const validation = validateAppointmentData({ doctorId, date, slot });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctor.isActive) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available",
      });
    }

    let patient;

    if (req.user.role === "patient") {
      patient = await Patient.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient record not found. Please contact administrator.",
        });
      }
    } else if (patientId) {
      if (!isValidObjectId(patientId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid patient ID",
        });
      }

      patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }
    } else if (patientData) {
      const patientValidation = validatePatientData(patientData, true);
      if (!patientValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Patient validation failed",
          errors: patientValidation.errors,
        });
      }

      const existingPatient = await Patient.findOne({
        phone: patientData.phone,
      });
      if (existingPatient) {
        patient = existingPatient;
      } else {
        patient = new Patient({
          name: patientData.name,
          phone: patientData.phone,
          email: patientData.email || null,
          age: patientData.age || null,
          gender: patientData.gender || null,
          address: patientData.address || null,
          bloodGroup: patientData.bloodGroup || null,
        });
        await patient.save();

        await createAuditLog({
          userId: req.user.id,
          userRole: req.user.role,
          action: "CREATE_PATIENT",
          entity: "Patient",
          entityId: patient._id,
          details: { name: patient.name, phone: patient.phone },
          req,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Patient information is required (provide patientId or patientData)",
      });
    }

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      slot,
      status: { $in: ["scheduled", "arrived"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Slot is already booked",
      });
    }

    const dayOfWeek = new Date(date)
      .toLocaleDateString("en-us", { weekday: "long" })
      .toLowerCase();
    const schedule = doctor.schedule.find((s) => s.day === dayOfWeek);

    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: "Doctor not available on this day",
      });
    }

    const availableSlots = generateSlots(
      schedule.start,
      schedule.end,
      doctor.slotDuration,
      schedule.breaks || [],
    );

    if (!availableSlots.includes(slot)) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot time",
      });
    }

    if (isPastDateTime(date, slot)) {
      return res.status(400).json({
        success: false,
        message: "Cannot book appointments for past time",
      });
    }

    const appointment = new Appointment({
      doctor: doctorId,
      patient: patient._id,
      date,
      slot,
      purpose: purpose || "",
      notes: notes || "",
      status: "scheduled",
      createdBy: req.user.id,
    });

    await appointment.save();

    await appointment.populate([
      { path: "doctor", populate: { path: "user", select: "name email" } },
      { path: "patient", select: "name phone email patientId" },
    ]);

    await createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "CREATE_APPOINTMENT",
      entity: "Appointment",
      entityId: appointment._id,
      details: { date, slot, patientName: patient.name },
      req,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("Book appointment error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slot is already booked",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      date,
      status,
      page = 1,
      limit = 50,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found",
        });
      }
      query.doctor = doctor._id;
    } else if (req.user.role === "patient") {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }
      query.patient = patient._id;
    }

    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
    if (date) query.date = date;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate("doctor", "department specialization slotDuration")
        .populate({
          path: "doctor",
          populate: { path: "user", select: "name email" },
        })
        .populate("patient", "name phone email patientId age gender")
        .sort({ date: -1, slot: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments(query),
    ]);

    res.json({
      success: true,
      appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id)
      .populate("doctor", "department specialization slotDuration")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      })
      .populate(
        "patient",
        "name phone email patientId age gender address bloodGroup",
      );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (appointment.doctor._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this appointment",
        });
      }
    } else if (req.user.role === "patient") {
      const patient = await Patient.findOne({ user: req.user.id });
      if (appointment.patient._id.toString() !== patient._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this appointment",
        });
      }
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Get appointment by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { purpose, notes, status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (purpose !== undefined) appointment.purpose = purpose;
    if (notes !== undefined) appointment.notes = notes;
    if (
      status &&
      ["scheduled", "arrived", "completed", "cancelled"].includes(status)
    ) {
      appointment.status = status;
    }

    appointment.updatedBy = req.user.id;
    await appointment.save();

    await createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "UPDATE_APPOINTMENT",
      entity: "Appointment",
      entityId: appointment._id,
      details: { purpose, notes, status },
      req,
    });

    res.json({
      success: true,
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete completed appointments",
      });
    }

    await Appointment.findByIdAndDelete(id);

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "DELETE_APPOINTMENT",
      entity: "Appointment",
      entityId: id,
      details: {
        date: appointment.date,
        slot: appointment.slot,
      },
      req,
    });

    res.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Delete appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.markAsArrived = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: `Cannot mark as arrived. Current status: ${appointment.status}`,
      });
    }

    appointment.status = "arrived";
    appointment.arrivedAt = new Date();
    appointment.updatedBy = req.user.id;
    await appointment.save();

    await createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "MARK_ARRIVED",
      entity: "Appointment",
      entityId: appointment._id,
      details: { date: appointment.date, slot: appointment.slot },
      req,
    });

    res.json({
      success: true,
      message: "Patient marked as arrived",
      appointment,
    });
  } catch (error) {
    console.error("Mark as arrived error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID and date are required",
      });
    }

    return res.status(200).json({
      success: false,
      message: "Use /api/doctors/:id/slots endpoint instead",
    });
  } catch (error) {
    console.error("Get available slots error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAppointmentStats = async (req, res) => {
  try {
    const { startDate, endDate, doctorId } = req.query;

    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = startDate;
      if (endDate) matchQuery.date.$lte = endDate;
    }

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (doctor) {
        matchQuery.doctor = doctor._id;
      }
    } else if (doctorId) {
      matchQuery.doctor = doctorId;
    }

    const stats = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalAppointments = await Appointment.countDocuments(matchQuery);

    const formattedStats = {
      total: totalAppointments,
      scheduled: 0,
      arrived: 0,
      completed: 0,
      cancelled: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      stats: formattedStats,
    });
  } catch (error) {
    console.error("Get appointment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
