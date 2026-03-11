import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../context/UseContex";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Loader from "../../components/ui/Loader";
import { getAllDoctors, getDoctorSchedule } from "../../api/doctorApi";

const Doctors = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getAllDoctors();
      setDoctors(response.doctors || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      alert("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchedule = async (doctor) => {
    try {
      setSelectedDoctor(doctor);
      const response = await getDoctorSchedule(doctor._id);
      setSchedule(response.schedule);
      setShowScheduleModal(true);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      alert("Failed to fetch doctor schedule");
    }
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
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

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
            <p className="text-gray-600 mt-2">View and manage all doctors</p>
          </div>

          {doctors.length === 0 ? (
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No doctors found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No doctors are currently registered in the system.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <Card
                  key={doctor._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Dr. {doctor.user?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {doctor.department}
                          </p>
                          {doctor.specialization && (
                            <p className="text-sm text-blue-600">
                              {doctor.specialization}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            doctor.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {doctor.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          {doctor.user?.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {doctor.user?.phone}
                        </div>
                      </div>

                      {doctor.experience && (
                        <div className="mb-4">
                          <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                            {doctor.experience} years experience
                          </span>
                        </div>
                      )}

                      {doctor.qualification && (
                        <p className="text-sm text-gray-600 mb-4">
                          <span className="font-medium">Qualification:</span>{" "}
                          {doctor.qualification}
                        </p>
                      )}

                      {doctor.consultationFee && (
                        <p className="text-lg font-bold text-green-600 mb-4">
                          ₹{doctor.consultationFee} per consultation
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-4 mt-4 space-y-2">
                      {user.role === "patient" && (
                        <Button
                          onClick={() => navigate("/appointments/new")}
                          className="w-full"
                        >
                          Book Appointment
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        onClick={() => handleViewSchedule(doctor)}
                        className="w-full"
                      >
                        View Schedule
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Modal
            isOpen={showScheduleModal}
            onClose={() => {
              setShowScheduleModal(false);
              setSelectedDoctor(null);
              setSchedule(null);
            }}
            title={`Dr. ${selectedDoctor?.user?.name}'s Schedule`}
          >
            {schedule ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Working Hours
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">Start Time</p>
                      <p className="font-medium">
                        {formatTime(schedule.startTime)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">End Time</p>
                      <p className="font-medium">
                        {formatTime(schedule.endTime)}
                      </p>
                    </div>
                  </div>
                </div>

                {schedule.breakStart && schedule.breakEnd && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Break Time
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Break Start</p>
                        <p className="font-medium">
                          {formatTime(schedule.breakStart)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Break End</p>
                        <p className="font-medium">
                          {formatTime(schedule.breakEnd)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Slot Duration
                  </h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">
                      {schedule.slotDuration} minutes per appointment
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Working Days
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ].map((day) => (
                      <span
                        key={day}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          schedule.workingDays?.includes(day)
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No schedule information available
                </p>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </Layout>
  );
};

export default Doctors;
