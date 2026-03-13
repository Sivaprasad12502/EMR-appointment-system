const User = require("../models/User");
const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");
const { createAuditLog } = require("../utils/auditLogger");
const { isValidEmail, isStrongPassword } = require("../utils/validator");
const mongoose = require("mongoose")

exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, age, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
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

    const existing = await User.findOne({ email });
    if (existing) {
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
      role: "patient",
    });
    await user.save();

    const patientData = {
      user: user._id,
      name,
      email,
    };

    if (phone && phone.trim()) {
      patientData.phone = phone.trim();
    }
    if (age !== undefined && age !== null) {
      patientData.age = age;
    }
    if (gender && gender.trim()) {
      patientData.gender = gender.toLowerCase();
    }

    const patient = new Patient(patientData);
    await patient.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await createAuditLog({
      userId: user._id.toString(),
      userRole: user.role,
      action: "REGISTER_SUCCESS",
      entity: "Auth",
      details: { email, role: "patient" },
      req,
    });
    res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      secure:process.env.NODE_ENV==="production",
      sameSite:"strict",
      maxAge:7*24*60*60*1000,
    })

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (
      email === process.env.SUPER_ADMIN_EMAIL &&
      password === process.env.SUPER_ADMIN_PASSWORD
    ) {
      const user = {
        id: new mongoose.Types.ObjectId(), //Dummy ID for super admin,
        role: "super_admin",
        name: process.env.SUPER_ADMIN_NAME || "Super Admin",
        email: process.env.SUPER_ADMIN_EMAIL,
      };

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await createAuditLog({
        userId: "superadmin",
        userRole: "super_admin",
        action: "LOGIN_SUCCESS",
        entity: "Auth",
        details: { email },
        req,
      });
      res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"strict",
        maxAge:7*24*60*60*1000
      })

      return res.json({
        success: true,
        accessToken,
        
        user,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      await createAuditLog({
        userId: "unknown",
        userRole: "unknown",
        action: "LOGIN_FAILED",
        entity: "Auth",
        details: { email, reason: "User not found" },
        req,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact administrator.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await createAuditLog({
        userId: user._id.toString(),
        userRole: user.role,
        action: "LOGIN_FAILED",
        entity: "Auth",
        details: { email, reason: "Invalid password" },
        req,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await createAuditLog({
      userId: user._id.toString(),
      userRole: user.role,
      action: "LOGIN_SUCCESS",
      entity: "Auth",
      details: { email },
      req,
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      {
        id: decoded.id,
        role: decoded.role,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }

};

exports.logout=async (req,res) => {
  res.clearCookie("refreshToken")
  res.json({
    success:true,
    message:"Logged out successfully"
  })
  
}

exports.getMe = async (req, res) => {
  try {
    if (req.user.id === "superadmin") {
      return res.json({
        success: true,
        user: {
          id: "superadmin",
          name: process.env.SUPER_ADMIN_NAME || "Super Admin",
          email: process.env.SUPER_ADMIN_EMAIL,
          role: "super_admin",
        },
      });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
