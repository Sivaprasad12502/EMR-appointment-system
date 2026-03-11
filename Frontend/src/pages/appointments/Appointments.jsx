import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../context/UseContex";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import {
  getAppointments,
  updateAppointment,
  markAsArrived,
} from "../../api/appointmentApi";

const Appointments = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: "",
    date: "",
  });

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.date) params.date = filter.date;

      const response = await getAppointments(params);
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      alert("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateAppointment(id, { status: newStatus });
      alert("Appointment status updated successfully");
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment status");
    }
  };

  const handleMarkAsArrived = async (id) => {
    try {
      await markAsArrived(id);
      alert("Patient marked as arrived");
      fetchAppointments();
    } catch (error) {
      console.error("Error marking as arrived:", error);
      alert("Failed to mark patient as arrived");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      arrived: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      no_show: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-600 mt-2">
                {user.role === "patient"
                  ? "View your appointments"
                  : "View and manage all appointments"}
              </p>
            </div>
            {(user.role === "receptionist" || user.role === "patient") && (
              <Button onClick={() => navigate("/appointments/new")}>
                Book New Appointment
              </Button>
            )}
          </div>

          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={filter.status}
                  onChange={(e) =>
                    setFilter({ ...filter, status: e.target.value })
                  }
                >
                  <option value="">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="arrived">Arrived</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={filter.date}
                  onChange={(e) =>
                    setFilter({ ...filter, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={() => setFilter({ status: "", date: "" })}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            {appointments.length === 0 ? (
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No appointments found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or create a new appointment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.slot}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patient?.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.doctor?.user?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.doctor?.department}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.status.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {appointment.reason || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {appointment.status === "scheduled" &&
                              (user.role === "receptionist" ||
                                user.role === "super_admin") && (
                                <button
                                  onClick={() =>
                                    handleMarkAsArrived(appointment._id)
                                  }
                                  className="text-yellow-600 hover:text-yellow-900"
                                >
                                  Mark Arrived
                                </button>
                              )}
                            {appointment.status === "scheduled" &&
                              (user.role === "patient" ||
                                user.role === "receptionist" ||
                                user.role === "super_admin") && (
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment._id,
                                      "cancelled",
                                    )
                                  }
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Cancel
                                </button>
                              )}
                            {appointment.status === "arrived" &&
                              user.role === "doctor" && (
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment._id,
                                      "completed",
                                    )
                                  }
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Complete
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
