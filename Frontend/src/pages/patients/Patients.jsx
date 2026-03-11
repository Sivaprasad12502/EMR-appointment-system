import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import Loader from "../../components/ui/Loader";
import {
  searchPatients,
  getAllPatients,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientAppointments,
} from "../../api/patientApi";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    bloodGroup: "",
    emergencyContact: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getAllPatients();
      setPatients(response.patients || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      alert("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPatients();
      return;
    }

    try {
      setLoading(true);
      const response = await searchPatients(searchQuery);
      setPatients(response.patients || []);
    } catch (error) {
      console.error("Error searching patients:", error);
      alert("Failed to search patients");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      if (isEditing && selectedPatient) {
        await updatePatient(selectedPatient._id, formData);
        alert("Patient updated successfully!");
      } else {
        await createPatient(formData);
        alert("Patient created successfully!");
      }

      setShowModal(false);
      resetForm();
      fetchPatients();
    } catch (error) {
      console.error("Error saving patient:", error);
      alert(error.response?.data?.message || "Failed to save patient");
    }
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name || "",
      phone: patient.phone || "",
      email: patient.email || "",
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split("T")[0] : "",
      gender: patient.gender || "",
      address: patient.address || "",
      bloodGroup: patient.bloodGroup || "",
      emergencyContact: patient.emergencyContact || "",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;

    try {
      await deletePatient(id);
      alert("Patient deleted successfully!");
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Failed to delete patient");
    }
  };

  const handleViewAppointments = async (patient) => {
    try {
      setSelectedPatient(patient);
      const response = await getPatientAppointments(patient._id);
      setPatientAppointments(response.appointments || []);
      setShowAppointmentsModal(true);
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
      alert("Failed to fetch patient appointments");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      bloodGroup: "",
      emergencyContact: "",
    });
    setSelectedPatient(null);
    setIsEditing(false);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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
              <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
              <p className="text-gray-600 mt-2">
                Search and manage patient records
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              Add New Patient
            </Button>
          </div>

          <Card className="mb-6">
            <div className="flex gap-4">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, or email..."
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>Search</Button>
              {searchQuery && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery("");
                    fetchPatients();
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </Card>

          {patients.length === 0 ? (
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No patients found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery
                    ? "Try a different search term"
                    : "Get started by adding a new patient."}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map((patient) => (
                <Card
                  key={patient._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {patient.name}
                      </h3>

                      <div className="flex gap-2 mb-3">
                        {patient.dateOfBirth && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {calculateAge(patient.dateOfBirth)} years
                          </span>
                        )}
                        {patient.gender && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded capitalize">
                            {patient.gender}
                          </span>
                        )}
                        {patient.bloodGroup && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                            {patient.bloodGroup}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-3">
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
                          {patient.phone}
                        </div>
                        {patient.email && (
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
                            {patient.email}
                          </div>
                        )}
                      </div>

                      {patient.address && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {patient.address}
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-4 mt-4 flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleViewAppointments(patient)}
                        className="flex-1 text-sm"
                      >
                        Appointments
                      </Button>
                      <button
                        onClick={() => handleEdit(patient)}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Modal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              resetForm();
            }}
            title={isEditing ? "Edit Patient" : "Add New Patient"}
          >
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name *"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <Input
                  label="Phone *"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <Select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
                <Input
                  label="Blood Group"
                  value={formData.bloodGroup}
                  onChange={(e) =>
                    setFormData({ ...formData, bloodGroup: e.target.value })
                  }
                  placeholder="e.g., A+, B-, O+"
                />
                <Input
                  label="Emergency Contact"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: e.target.value,
                    })
                  }
                  placeholder="Emergency contact number"
                  className="md:col-span-2"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full address"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Patient" : "Create Patient"}
                </Button>
              </div>
            </form>
          </Modal>
          <Modal
            isOpen={showAppointmentsModal}
            onClose={() => {
              setShowAppointmentsModal(false);
              setSelectedPatient(null);
              setPatientAppointments([]);
            }}
            title={`${selectedPatient?.name}'s Appointments`}
          >
            {patientAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No appointments found for this patient
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {patientAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">
                          Dr. {appointment.doctor?.user?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.doctor?.department}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          appointment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>📅 {formatDate(appointment.date)}</p>
                      <p>🕐 {appointment.slot}</p>
                      {appointment.reason && (
                        <p className="mt-1">💬 {appointment.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        </div>
      </div>
    </Layout>
  );
};

export default Patients;
