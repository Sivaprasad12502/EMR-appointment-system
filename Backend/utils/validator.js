const validator = require("validator");

const isValidEmail = (email) => {
  return validator.isEmail(email);
};

const isValidPhone = (phone) => {
  return /^[0-9]{10,15}$/.test(phone);
};

const isValidDate = (date) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
};

const isValidTime = (time) => {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

const isPastDate = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(dateString);
  return checkDate < today;
};

const isPastDateTime = (dateString, timeString) => {
  const now = new Date();
  const checkDateTime = new Date(`${dateString}T${timeString}:00`);
  return checkDateTime < now;
};

const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return validator.escape(str.trim());
};

const isStrongPassword = (password) => {
  return (
    password.length >= 6 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
  );
};

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const validateAppointmentData = (data) => {
  const errors = [];

  if (!data.doctorId || !isValidObjectId(data.doctorId)) {
    errors.push("Valid doctor ID is required");
  }

  if (!data.date || !isValidDate(data.date)) {
    errors.push("Valid date is required (YYYY-MM-DD)");
  } else if (isPastDate(data.date)) {
    errors.push("Cannot book appointments for past dates");
  }

  if (!data.slot || !isValidTime(data.slot)) {
    errors.push("Valid slot time is required (HH:MM)");
  } else if (data.date && isPastDateTime(data.date, data.slot)) {
    errors.push("Cannot book appointments for past time");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validatePatientData = (data, isNew = true) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Valid name is required (minimum 2 characters)");
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push("Valid phone number is required (10-15 digits)");
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push("Invalid email format");
  }

  if (data.age && (data.age < 0 || data.age > 150)) {
    errors.push("Age must be between 0 and 150");
  }

  if (
    data.gender &&
    !["male", "female", "other"].includes(data.gender.toLowerCase())
  ) {
    errors.push("Gender must be male, female, or other");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidDate,
  isValidTime,
  isPastDate,
  isPastDateTime,
  sanitizeString,
  isStrongPassword,
  isValidObjectId,
  validateAppointmentData,
  validatePatientData,
};
