const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const generateSlots = require("../utils/generateSlots");
const { createAuditLog } = require("../utils/auditLogger");
const { isValidObjectId } = require("../utils/validator");

exports.getAllDoctors = async (req, res) => {
  try {
    const { department, isActive, search } = req.query;

    const query = {};
    if (department) query.department = department;

    if (isActive !== undefined) {
      query.isActive = isActive === "true" || isActive === true;
    }

    const doctors = await Doctor.find(query)
      .populate("user", "name email isActive")
      .sort({ createdAt: -1 });

    let filteredDoctors = doctors;
    if (search) {
      filteredDoctors = doctors.filter(
        (doctor) =>
          doctor.user?.name.toLowerCase().includes(search.toLowerCase()) ||
          doctor.department.toLowerCase().includes(search.toLowerCase()) ||
          doctor.specialization?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    filteredDoctors = filteredDoctors.filter(
      (doctor) => doctor.user && doctor.user.isActive !== false,
    );

    console.log(
      `[getAllDoctors] Found ${doctors.length} doctors, filtered to ${filteredDoctors.length}`,
    );

    res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      doctors: filteredDoctors,
    });
  } catch (error) {
    console.error("Get all doctors error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving doctors",
      error: error.message,
    });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id).populate(
      "user",
      "name email isActive",
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get doctor by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving doctor",
      error: error.message,
    });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      department,
      specialization,
      qualification,
      experience,
      schedule,
      slotDuration,
      isActive,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (name || email) {
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      await User.findByIdAndUpdate(doctor.user, updateData);
    }

    if (department) doctor.department = department;
    if (specialization) doctor.specialization = specialization;
    if (qualification) doctor.qualification = qualification;
    if (experience !== undefined) doctor.experience = experience;
    if (schedule) doctor.schedule = schedule;
    if (slotDuration) doctor.slotDuration = slotDuration;
    if (typeof isActive === "boolean") doctor.isActive = isActive;

    await doctor.save();

    await createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "UPDATE_DOCTOR",
      entity: "Doctor",
      entityId: doctor._id,
      details: { department, specialization },
      req,
    });

    res.json({
      success: true,
      message: "Doctor updated successfully",
      doctor,
    });
  } catch (error) {
    console.error("Update doctor error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating doctor",
      error: error.message,
    });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    doctor.isActive = false;
    await doctor.save();

    await User.findByIdAndUpdate(doctor.user, { isActive: false });

    await createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "DELETE_USER",
      entity: "Doctor",
      entityId: doctor._id,
      details: { department: doctor.department },
      req,
    });

    res.json({
      success: true,
      message: "Doctor deactivated successfully",
    });
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting doctor",
      error: error.message,
    });
  }
};

exports.getDoctorSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    let transformedSchedule = {
      startTime: "",
      endTime: "",
      breakStart: "",
      breakEnd: "",
      slotDuration: doctor.slotDuration || 30,
      workingDays: [],
    };

    if (doctor.schedule && doctor.schedule.length > 0) {
      transformedSchedule.workingDays = doctor.schedule.map((s) => s.day);

      const firstSchedule = doctor.schedule[0];
      transformedSchedule.startTime = firstSchedule.start || "";
      transformedSchedule.endTime = firstSchedule.end || "";

      if (firstSchedule.breaks && firstSchedule.breaks.length > 0) {
        transformedSchedule.breakStart = firstSchedule.breaks[0].start || "";
        transformedSchedule.breakEnd = firstSchedule.breaks[0].end || "";
      }
    }

    res.json({
      success: true,
      schedule: transformedSchedule,
      slotDuration: doctor.slotDuration,
    });
  } catch (error) {
    console.error("Get doctor schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving schedule",
      error: error.message,
    });
  }
};

exports.updateDoctorSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      schedule,
      slotDuration,
      startTime,
      endTime,
      breakStart,
      breakEnd,
      workingDays,
    } = req.body;

    console.log(
      "[updateDoctorSchedule] Request body:",
      JSON.stringify(req.body, null, 2),
    );

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (req.user.role !== "super_admin") {
      const doctorUser = await Doctor.findOne({ user: req.user.id });
      if (!doctorUser || doctorUser._id.toString() !== id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this schedule",
        });
      }
    }

    if (workingDays && Array.isArray(workingDays)) {
      console.log(
        "[updateDoctorSchedule] Processing flat format from req.body",
      );

      if (startTime && endTime) {
        const startMinutes =
          parseInt(startTime.split(":")[0]) * 60 +
          parseInt(startTime.split(":")[1]);
        const endMinutes =
          parseInt(endTime.split(":")[0]) * 60 +
          parseInt(endTime.split(":")[1]);

        if (startMinutes >= endMinutes) {
          return res.status(400).json({
            success: false,
            message: `Invalid schedule: Start time (${startTime}) must be before end time (${endTime})`,
          });
        }
      }

      const transformedSchedule = workingDays.map((day) => {
        const daySchedule = {
          day: day,
          start: startTime || "",
          end: endTime || "",
          breaks: [],
        };

        if (breakStart && breakEnd) {
          daySchedule.breaks.push({
            start: breakStart,
            end: breakEnd,
          });
        }

        return daySchedule;
      });

      console.log(
        "[updateDoctorSchedule] Transformed schedule:",
        transformedSchedule,
      );
      doctor.schedule = transformedSchedule;
      if (slotDuration) doctor.slotDuration = slotDuration;
    } else if (schedule) {
      console.log("[updateDoctorSchedule] Schedule received:", schedule);

      if (schedule.workingDays && Array.isArray(schedule.workingDays)) {
        const transformedSchedule = schedule.workingDays.map((day) => {
          const daySchedule = {
            day: day,
            start: schedule.startTime || "",
            end: schedule.endTime || "",
            breaks: [],
          };

          if (schedule.breakStart && schedule.breakEnd) {
            daySchedule.breaks.push({
              start: schedule.breakStart,
              end: schedule.breakEnd,
            });
          }

          return daySchedule;
        });

        console.log(
          "[updateDoctorSchedule] Transformed schedule:",
          transformedSchedule,
        );
        doctor.schedule = transformedSchedule;
        if (schedule.slotDuration) doctor.slotDuration = schedule.slotDuration;
      } else if (Array.isArray(schedule)) {
        console.log("[updateDoctorSchedule] Schedule is array, using as is");
        doctor.schedule = schedule;
      }
    }

    if (slotDuration && !doctor.slotDuration) {
      doctor.slotDuration = slotDuration;
    }

    console.log(
      "[updateDoctorSchedule] Saving doctor with schedule:",
      doctor.schedule,
    );
    await doctor.save();
    console.log("[updateDoctorSchedule] Schedule saved successfully");

    await createAuditLog({
      userId: req.user.id,
      userRole: req.user.role,
      action: "UPDATE_DOCTOR",
      entity: "Doctor",
      entityId: doctor._id,
      details: { action: "Schedule update" },
      req,
    });

    let transformedSchedule = {
      startTime: "",
      endTime: "",
      breakStart: "",
      breakEnd: "",
      slotDuration: doctor.slotDuration || 30,
      workingDays: [],
    };

    if (doctor.schedule && doctor.schedule.length > 0) {
      transformedSchedule.workingDays = doctor.schedule.map((s) => s.day);
      const firstSchedule = doctor.schedule[0];
      transformedSchedule.startTime = firstSchedule.start || "";
      transformedSchedule.endTime = firstSchedule.end || "";

      if (firstSchedule.breaks && firstSchedule.breaks.length > 0) {
        transformedSchedule.breakStart = firstSchedule.breaks[0].start || "";
        transformedSchedule.breakEnd = firstSchedule.breaks[0].end || "";
      }
    }

    res.json({
      success: true,
      message: "Schedule updated successfully",
      schedule: transformedSchedule,
      slotDuration: doctor.slotDuration,
    });
  } catch (error) {
    console.error("Update doctor schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating schedule",
      error: error.message,
    });
  }
};

exports.getDoctorSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    console.log(`[getDoctorSlots] Request - Doctor: ${id}, Date: ${date}`);

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Valid date is required (YYYY-MM-DD)",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot view slots for past dates",
      });
    }

    const doctor = await Doctor.findById(id);
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

    const dayOfWeek = new Date(date)
      .toLocaleDateString("en-us", { weekday: "long" })
      .toLowerCase();
    console.log(`[getDoctorSlots] Day of week: ${dayOfWeek}`);

    const schedule = doctor.schedule.find((s) => s.day === dayOfWeek);

    console.log(`[getDoctorSlots] Schedule found:`, schedule);

    if (!schedule) {
      console.log(`[getDoctorSlots] No schedule for ${dayOfWeek}`);
      return res.json({
        success: true,
        slots: [],
        availableSlots: [],
        bookedSlots: [],
        message: "Doctor not available on this day",
      });
    }

    console.log(
      `[getDoctorSlots] Generating slots: ${schedule.start} - ${schedule.end}, duration: ${doctor.slotDuration}`,
    );
    const allSlots = generateSlots(
      schedule.start,
      schedule.end,
      doctor.slotDuration,
      schedule.breaks || [],
    );

    console.log(
      `[getDoctorSlots] Generated ${allSlots.length} slots:`,
      allSlots.slice(0, 5),
      "...",
    );

    const bookedAppointments = await Appointment.find({
      doctor: id,
      date,
      status: { $in: ["scheduled", "arrived"] },
    }).select("slot status");

    const bookedSlots = bookedAppointments.map((apt) => ({
      slot: apt.slot,
      status: apt.status,
    }));

    const bookedSlotTimes = bookedSlots.map((b) => b.slot);
    console.log(`[getDoctorSlots] Booked slots:`, bookedSlotTimes);

    let availableSlots = allSlots;
    const now = new Date();
    const isToday = bookingDate.toDateString() === now.toDateString();

    if (isToday) {
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      console.log(
        `[getDoctorSlots] Filtering past slots for today. Current time: ${currentTime}`,
      );
      availableSlots = allSlots.filter(
        (slot) => slot > currentTime && !bookedSlotTimes.includes(slot),
      );
    } else {
      availableSlots = allSlots.filter(
        (slot) => !bookedSlotTimes.includes(slot),
      );
    }

    console.log(
      `[getDoctorSlots] Returning ${availableSlots.length} available slots`,
    );

    res.json({
      success: true,
      slots: availableSlots,
      availableSlots,
      bookedSlots,
      slotDuration: doctor.slotDuration,
    });
  } catch (error) {
    console.error("Get doctor slots error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving slots",
      error: error.message,
    });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Doctor.distinct("department", { isActive: true });

    res.json({
      success: true,
      departments: departments.filter((d) => d),
    });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving departments",
      error: error.message,
    });
  }
};
