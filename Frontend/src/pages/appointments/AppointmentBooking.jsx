import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../context/UseContex";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import { getAllDoctors, getDoctorSlots } from "../../api/doctorApi";
import { bookAppointment } from "../../api/appointmentApi";
import { searchPatients } from "../../api/patientApi";

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const isPatient = user?.role === "patient";
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      console.log("[fetchDoctors] Fetching doctors...");
      const response = await getAllDoctors({ isActive: true });
      console.log("[fetchDoctors] Response:", response);
      console.log(
        "[fetchDoctors] Doctors count:",
        response.doctors?.length || 0,
      );
      setDoctors(response.doctors || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      console.error("Error response:", error.response?.data);
      alert("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    try {
      setLoadingSlots(true);
      const response = await getDoctorSlots(selectedDoctor, selectedDate);
      setSlots(response.slots || []);
    } catch (error) {
      console.error("Error fetching slots:", error);
      alert("Failed to fetch available slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSearchPatients = async () => {
    if (!patientSearch.trim()) return;

    try {
      const response = await searchPatients(patientSearch);
      setSearchResults(response.patients || []);
    } catch (error) {
      console.error("Error searching patients:", error);
      alert("Failed to search patients");
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchResults([]);
    setPatientSearch("");
  };

  const handleBookAppointment = async () => {
    try {
      setLoading(true);

      const appointmentData = {
        doctorId: selectedDoctor,
        date: selectedDate,
        slot: selectedSlot,
        purpose: reason,
      };

      // For patients, no need to provide patient info (backend will use logged-in user)
      // For receptionists, add patient data
      if (!isPatient) {
        if (selectedPatient) {
          appointmentData.patientId = selectedPatient._id;
        } else {
          appointmentData.patientData = newPatient;
        }
      }

      await bookAppointment(appointmentData);
      alert("Appointment booked successfully!");
      navigate("/appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert(error.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 = selectedDoctor && selectedDate;
  const canProceedToStep3 = selectedSlot;
  const canSubmit = isPatient
    ? true
    : selectedPatient || (newPatient.name && newPatient.phone);

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Book New Appointment
            </h1>
            <p className="text-gray-600 mt-2">
              {isPatient
                ? "Schedule your appointment with a doctor"
                : "Schedule a new appointment for a patient"}
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div
                className={`flex items-center ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  1
                </div>
                <span className="ml-2 font-medium">Doctor & Date</span>
              </div>
              <div
                className={`w-24 h-1 mx-4 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
              ></div>
              <div
                className={`flex items-center ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  2
                </div>
                <span className="ml-2 font-medium">Time Slot</span>
              </div>
              {!isPatient && (
                <>
                  <div
                    className={`w-24 h-1 mx-4 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}
                  ></div>
                  <div
                    className={`flex items-center ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    >
                      3
                    </div>
                    <span className="ml-2 font-medium">Patient Info</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {step === 1 && (
            <Card title="Select Doctor and Date">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Doctor
                  </label>
                  <Select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    required
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.user?.name} - {doctor.department}{" "}
                        {doctor.specialization && `(${doctor.specialization})`}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/appointments")}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      fetchSlots();
                      setStep(2);
                    }}
                    disabled={!canProceedToStep2}
                  >
                    Next: Select Time Slot
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card title="Select Time Slot">
              {loadingSlots ? (
                <div className="flex justify-center py-12">
                  <Loader size="lg" />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No available slots for the selected date
                  </p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                    {slots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          selectedSlot === slot
                            ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                            : "border-gray-200 hover:border-blue-300 text-gray-700"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  {isPatient && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Visit (Optional)
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Describe the reason for this appointment..."
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <Button variant="secondary" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    {isPatient ? (
                      <Button
                        onClick={handleBookAppointment}
                        disabled={!canProceedToStep3 || loading}
                      >
                        {loading ? "Booking..." : "Confirm & Book Appointment"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setStep(3)}
                        disabled={!canProceedToStep3}
                      >
                        Next: Patient Information
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}

          {step === 3 && (
            <Card title="Patient Information">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Existing Patient
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="Search by name, phone, or email..."
                      className="flex-1"
                    />
                    <Button onClick={handleSearchPatients}>Search</Button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg divide-y max-h-60 overflow-y-auto">
                      {searchResults.map((patient) => (
                        <div
                          key={patient._id}
                          onClick={() => handleSelectPatient(patient)}
                          className="p-3 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-gray-500">
                            {patient.phone} • {patient.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedPatient && (
                    <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-green-900">
                            {selectedPatient.name}
                          </div>
                          <div className="text-sm text-green-700">
                            {selectedPatient.phone} • {selectedPatient.email}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedPatient(null)}
                          className="text-green-700 hover:text-green-900"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {!selectedPatient && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Or Create New Patient
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Name *"
                        value={newPatient.name}
                        onChange={(e) =>
                          setNewPatient({ ...newPatient, name: e.target.value })
                        }
                        placeholder="Patient name"
                        required
                      />
                      <Input
                        label="Phone *"
                        value={newPatient.phone}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Phone number"
                        required
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={newPatient.email}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            email: e.target.value,
                          })
                        }
                        placeholder="Email address"
                      />
                      <Input
                        label="Date of Birth"
                        type="date"
                        value={newPatient.dateOfBirth}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <Select
                          value={newPatient.gender}
                          onChange={(e) =>
                            setNewPatient({
                              ...newPatient,
                              gender: e.target.value,
                            })
                          }
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Select>
                      </div>
                      <Input
                        label="Address"
                        value={newPatient.address}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            address: e.target.value,
                          })
                        }
                        placeholder="Address"
                        className="md:col-span-2"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the reason for this appointment..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-between gap-4">
                  <Button variant="secondary" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleBookAppointment}
                    disabled={!canSubmit || loading}
                  >
                    {loading ? "Booking..." : "Book Appointment"}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentBooking;
