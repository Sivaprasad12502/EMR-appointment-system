import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../context/UseContex";
import { useNavigate } from "react-router-dom";
import { getAppointmentStats } from "../../api/appointmentApi";
import { getAllDoctors } from "../../api/doctorApi";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";

const Dashboard = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (
        user.role === "super_admin" ||
        user.role === "doctor" ||
        user.role === "receptionist"
      ) {
        const statsData = await getAppointmentStats();
        setStats(statsData.stats);
      }

      if (user.role === "super_admin" || user.role === "receptionist") {
        const doctorsData = await getAllDoctors();
        setDoctors(doctorsData.doctors);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Appointments</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Scheduled</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.scheduled}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <svg
                      className="w-8 h-8 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.completed}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.cancelled}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {user.role === "patient" && !stats && (
            <div className="mb-8">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-4 bg-blue-100 rounded-full mr-4">
                    <svg
                      className="w-10 h-10 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Welcome to EMR Appointment System
                    </h3>
                    <p className="text-gray-700 mt-1">
                      Book appointments with ease and manage your healthcare
                      journey.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {(user.role === "super_admin" || user.role === "receptionist") &&
            doctors.length > 0 && (
              <Card title="Available Doctors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctors.slice(0, 6).map((doctor) => (
                    <div
                      key={doctor._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-semibold text-lg text-gray-900">
                        {doctor.user?.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {doctor.department}
                      </p>
                      {doctor.specialization && (
                        <p className="text-sm text-gray-500">
                          {doctor.specialization}
                        </p>
                      )}
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            doctor.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {doctor.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          <div className="mt-8">
            <Card title="Quick Actions">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.role === "patient" && (
                  <>
                    <button
                      onClick={() => navigate("/appointments/new")}
                      className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                    >
                      <h5 className="font-semibold text-blue-900">
                        Book Appointment
                      </h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Schedule a new appointment
                      </p>
                    </button>
                    <button
                      onClick={() => navigate("/appointments")}
                      className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                    >
                      <h5 className="font-semibold text-green-900">
                        My Appointments
                      </h5>
                      <p className="text-sm text-green-700 mt-1">
                        View your appointments
                      </p>
                    </button>
                    <button
                      onClick={() => navigate("/doctors")}
                      className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                    >
                      <h5 className="font-semibold text-purple-900">
                        View Doctors
                      </h5>
                      <p className="text-sm text-purple-700 mt-1">
                        Browse available doctors
                      </p>
                    </button>
                  </>
                )}
                {user.role === "receptionist" && (
                  <>
                    <button
                      onClick={() => navigate("/appointments/new")}
                      className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                    >
                      <h5 className="font-semibold text-blue-900">
                        Book Appointment
                      </h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Schedule a new appointment
                      </p>
                    </button>
                    <button
                      onClick={() => navigate("/appointments")}
                      className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                    >
                      <h5 className="font-semibold text-green-900">
                        View Appointments
                      </h5>
                      <p className="text-sm text-green-700 mt-1">
                        Manage all appointments
                      </p>
                    </button>
                    <button
                      onClick={() => navigate("/patients")}
                      className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                    >
                      <h5 className="font-semibold text-purple-900">
                        Patient Records
                      </h5>
                      <p className="text-sm text-purple-700 mt-1">
                        Search and manage patients
                      </p>
                    </button>
                  </>
                )}
                {user.role === "doctor" && (
                  <>
                    <button
                      onClick={() => navigate("/appointments")}
                      className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                    >
                      <h5 className="font-semibold text-blue-900">
                        My Appointments
                      </h5>
                      <p className="text-sm text-blue-700 mt-1">
                        View your schedule
                      </p>
                    </button>
                    <button
                      onClick={() => navigate("/schedule")}
                      className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                    >
                      <h5 className="font-semibold text-green-900">
                        My Schedule
                      </h5>
                      <p className="text-sm text-green-700 mt-1">
                        Manage your availability
                      </p>
                    </button>
                  </>
                )}
                {user.role === "super_admin" && (
                  <>
                    <button
                      onClick={() => navigate("/admin")}
                      className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                    >
                      <h5 className="font-semibold text-blue-900">
                        Manage Users
                      </h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Create and manage users
                      </p>
                    </button>
                    <button
                      onClick={() => navigate("/doctors")}
                      className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                    >
                      <h5 className="font-semibold text-green-900">
                        Manage Doctors
                      </h5>
                      <p className="text-sm text-green-700 mt-1">
                        View and manage doctors
                      </p>
                    </button>
                    <button
                      onClick={() => navigate("/appointments")}
                      className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
                    >
                      <h5 className="font-semibold text-purple-900">
                        All Appointments
                      </h5>
                      <p className="text-sm text-purple-700 mt-1">
                        View system appointments
                      </p>
                    </button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
