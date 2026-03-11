import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../context/UseContex";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import { getDoctorSchedule, updateDoctorSchedule } from "../../api/doctorApi";
import { useAllDoctors } from "../../hooks/useUser";

const Schedule = () => {
  const { user } = useContext(Context);
  const { data: doctorsData } = useAllDoctors();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorId, setDoctorId] = useState(null);
  const [schedule, setSchedule] = useState({
    startTime: "",
    endTime: "",
    breakStart: "",
    breakEnd: "",
    slotDuration: 30,
    workingDays: [],
  });

  const weekDays = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  useEffect(() => {
    if (doctorsData?.doctors) {
      const doctor = doctorsData.doctors.find(
        (d) => d.user?._id === user.id || d.user?._id === user._id,
      );
      if (doctor) {
        setDoctorId(doctor._id);
        fetchSchedule(doctor._id);
      } else {
        setLoading(false);
      }
    }
  }, [doctorsData, user]);

  const fetchSchedule = async (id) => {
    try {
      setLoading(true);
      const response = await getDoctorSchedule(id);
      if (response.schedule) {
        setSchedule({
          startTime: response.schedule.startTime || "",
          endTime: response.schedule.endTime || "",
          breakStart: response.schedule.breakStart || "",
          breakEnd: response.schedule.breakEnd || "",
          slotDuration: response.schedule.slotDuration || 30,
          workingDays: response.schedule.workingDays || [],
        });
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      if (error.response?.status !== 404) {
        alert("Failed to fetch schedule");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingDayToggle = (day) => {
    setSchedule((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!doctorId) {
      alert("Doctor profile not found. Please contact administrator.");
      return;
    }

    if (!schedule.startTime || !schedule.endTime) {
      alert("Please set start and end times");
      return;
    }

    if (schedule.workingDays.length === 0) {
      alert("Please select at least one working day");
      return;
    }

    const startMinutes =
      parseInt(schedule.startTime.split(":")[0]) * 60 +
      parseInt(schedule.startTime.split(":")[1]);
    const endMinutes =
      parseInt(schedule.endTime.split(":")[0]) * 60 +
      parseInt(schedule.endTime.split(":")[1]);

    if (startMinutes >= endMinutes) {
      alert(
        `Invalid schedule: Start time (${schedule.startTime}) must be before end time (${schedule.endTime})`,
      );
      return;
    }

    try {
      setSaving(true);
      const response = await updateDoctorSchedule(doctorId, schedule);
      console.log("Schedule update response:", response);
      alert("Schedule updated successfully!");

      await fetchSchedule(doctorId);
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert(error.response?.data?.message || "Failed to update schedule");
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  if (!doctorId) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Doctor Profile Not Found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your doctor profile is not set up yet. Please contact the
                  administrator.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-600 mt-2">
              Manage your availability and working hours
            </p>
          </div>

          {(schedule.startTime || schedule.workingDays.length > 0) && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Current Schedule
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {schedule.startTime && (
                  <div>
                    <p className="text-xs text-blue-700">Working Hours</p>
                    <p className="font-medium text-blue-900">
                      {formatTime(schedule.startTime)} -{" "}
                      {formatTime(schedule.endTime)}
                    </p>
                  </div>
                )}
                {schedule.breakStart && (
                  <div>
                    <p className="text-xs text-blue-700">Break Time</p>
                    <p className="font-medium text-blue-900">
                      {formatTime(schedule.breakStart)} -{" "}
                      {formatTime(schedule.breakEnd)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-blue-700">Slot Duration</p>
                  <p className="font-medium text-blue-900">
                    {schedule.slotDuration} minutes
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-700">Working Days</p>
                  <p className="font-medium text-blue-900">
                    {schedule.workingDays.length} days/week
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card title="Update Schedule">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Working Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Start Time *"
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) =>
                      setSchedule({ ...schedule, startTime: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="End Time *"
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) =>
                      setSchedule({ ...schedule, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Break Time (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Break Start"
                    type="time"
                    value={schedule.breakStart}
                    onChange={(e) =>
                      setSchedule({ ...schedule, breakStart: e.target.value })
                    }
                  />
                  <Input
                    label="Break End"
                    type="time"
                    value={schedule.breakEnd}
                    onChange={(e) =>
                      setSchedule({ ...schedule, breakEnd: e.target.value })
                    }
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Set your lunch break or rest time. This time will not be
                  available for appointments.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Appointment Duration
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[15, 20, 30, 45, 60].map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() =>
                        setSchedule({ ...schedule, slotDuration: duration })
                      }
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        schedule.slotDuration === duration
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                          : "border-gray-200 hover:border-blue-300 text-gray-700"
                      }`}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Working Days *</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {weekDays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleWorkingDayToggle(day.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        schedule.workingDays.includes(day.value)
                          ? "border-green-600 bg-green-50 text-green-700 font-semibold"
                          : "border-gray-200 hover:border-green-300 text-gray-700"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {schedule.workingDays.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">
                    Please select at least one working day
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Schedule"}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="mt-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">📝 Schedule Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                • Set your regular working hours that will apply to all working
                days
              </li>
              <li>• Break time is optional but recommended for rest periods</li>
              <li>
                • Slot duration determines how long each appointment will be
              </li>
              <li>
                • You can select multiple working days (e.g., Monday to Friday)
              </li>
              <li>
                • Changes will affect appointments booked from tomorrow onwards
              </li>
              <li>
                • Make sure your times don't overlap (break time should be
                within working hours)
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
