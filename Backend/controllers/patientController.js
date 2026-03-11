const Patient = require("../models/Patient");
const { createAuditLog } = require("../utils/auditLogger");
const { validatePatientData, isValidObjectId } = require("../utils/validator");

exports.searchPatients = async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { patientId: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    };

    const patients = await Patient.find(searchQuery)
      .select("name phone email patientId age gender")
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      patients,
    });
  } catch (error) {
    console.error("Search patients error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { patientId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .select("name phone email patientId age gender createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Patient.countDocuments(query),
    ]);

    res.json({
      success: true,
      patients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all patients error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Get patient by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const patientData = req.body;

    const validation = validatePatientData(patientData, true);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const existingPatient = await Patient.findOne({ phone: patientData.phone });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient with this phone number already exists",
      });
    }

    const patient = new Patient({
      name: patientData.name,
      phone: patientData.phone,
      email: patientData.email || null,
      age: patientData.age || null,
      gender: patientData.gender || null,
      address: patientData.address || null,
      bloodGroup: patientData.bloodGroup || null,
      dob: patientData.dob || null,
      medicalHistory: patientData.medicalHistory || "",
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

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      patient,
    });
  } catch (error) {
    console.error("Create patient error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const allowedFields = [
      "name",
      "phone",
      "email",
      "age",
      "gender",
      "address",
      "bloodGroup",
      "dob",
      "medicalHistory",
    ];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        patient[field] = updateData[field];
      }
    });

    await patient.save();

    await createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "UPDATE_PATIENT",
      entity: "Patient",
      entityId: patient._id,
      details: { name: patient.name },
      req,
    });

    res.json({
      success: true,
      message: "Patient updated successfully",
      patient,
    });
  } catch (error) {
    console.error("Update patient error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    await Patient.findByIdAndDelete(id);

    await createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "DELETE_USER",
      entity: "Patient",
      entityId: id,
      details: { name: patient.name, phone: patient.phone },
      req,
    });

    res.json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("Delete patient error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const Appointment = require("../models/Appointment");

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find({ patient: id })
        .populate("doctor", "department specialization")
        .populate({
          path: "doctor",
          populate: { path: "user", select: "name" },
        })
        .sort({ date: -1, slot: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments({ patient: id }),
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
    console.error("Get patient appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = exports;
