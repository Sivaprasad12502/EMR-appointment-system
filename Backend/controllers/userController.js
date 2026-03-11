const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
const { createAuditLog } = require("../utils/auditLogger");
const {
  isValidEmail,
  isStrongPassword,
  isValidObjectId,
} = require("../utils/validator");

exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      specialization,
      qualification,
      experience,
      schedule,
      slotDuration,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required",
      });
    }

    if (!["doctor", "receptionist"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be doctor or receptionist",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters and contain letters and numbers",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role,
    });
    await user.save();

    if (role === "doctor") {
      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Department is required for doctors",
        });
      }

      const doctor = new Doctor({
        user: user._id,
        department: department || "",
        specialization: specialization || "",
        qualification: qualification || "",
        experience: experience || 0,
        schedule: schedule || [],
        slotDuration: slotDuration || 15,
      });
      await doctor.save();

      await createAuditLog({
        userId: req.user.id,
        userRole: req.user.role,
        action: "CREATE_DOCTOR",
        entity: "Doctor",
        entityId: doctor._id,
        details: { name, email, department },
        req,
      });
    }

    await createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "CREATE_USER",
      entity: "User",
      entityId: user._id,
      details: { name, email, role },
      req,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

exports.getAllusers = async (req, res) => {
  try {
    const { role, page = 1, limit = 50, search } = req.query;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: id });
      return res.status(200).json({
        success: true,
        user: {
          ...user.toObject(),
          doctorDetails: doctor,
        },
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user",
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, email, password, role, isActive } = req.body;

    if (name) user.name = name;
    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }
      user.email = email;
    }
    if (password) {
      if (!isStrongPassword(password)) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters and contain letters and numbers",
        });
      }
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }
    if (role && ["doctor", "receptionist", "patient"].includes(role)) {
      user.role = role;
    }
    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }

    await user.save();

    await createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "UPDATE_USER",
      entity: "User",
      entityId: user._id,
      details: { name, email, role },
      req,
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = false;
    await user.save();

    if (user.role === "doctor") {
      await Doctor.findOneAndUpdate({ user: id }, { isActive: false });
    }

    await createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "DELETE_USER",
      entity: "User",
      entityId: user._id,
      details: { name: user.name, email: user.email },
      req,
    });

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};
