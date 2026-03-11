import React, { useState } from "react";
import UseForm from "../../hooks/UseForm";
import Layout from "../../components/layout/Layout";

import { FaPlus, FaEdit, FaTrash, FaSave, FaUserMd } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

import {
  useAllUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useAllDoctors,
  useDeleteDoctor,
  useUpdateDoctor,
} from "../../hooks/useUser";

const Admin = () => {
  const { values, setValues, handleChange, resetForm } = UseForm({
    _id: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    department: "",
    specialization: "",
    experience: "",
    qualification: "",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading } = useAllUsers();
  const { data: doctorsData } = useAllDoctors();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const deleteDoctor = useDeleteDoctor();
  const updateDoctor = useUpdateDoctor();

  const users = data?.users || [];
  const allDoctors = doctorsData?.doctors || [];

  const doctors = allDoctors.filter(
    (d) => d.user?.isActive !== false && d.isActive !== false,
  );
  const receptionists = users.filter(
    (u) => u.role === "receptionist" && u.isActive !== false,
  );

  const openAddForm = (role) => {
    resetForm();
    setValues((prev) => ({
      ...prev,
      role,
    }));
    setIsEdit(false);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  const handleEdit = (user) => {
    if (user.user) {
      setValues({
        _id: user._id,
        name: user.user.name,
        email: user.user.email,
        phone: user.user.phone,
        role: "doctor",
        department: user.department || "",
        specialization: user.specialization || "",
        experience: user.experience || "",
        qualification: user.qualification || "",
        password: "",
      });
    } else {
      setValues({
        ...user,
        password: "",
      });
    }
    setIsEdit(true);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (values.role === "doctor") {
        const doctorData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: "doctor",
          department: values.department,
          specialization: values.specialization,
          experience: values.experience,
          qualification: values.qualification,
        };

        if (isEdit) {
          await updateDoctor.mutateAsync({
            id: values._id,
            data: doctorData,
          });
          setSuccess("Doctor updated successfully!");
        } else {
          await createUser.mutateAsync(doctorData);
          setSuccess("Doctor created successfully!");
        }
      } else {
        const userData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: values.role,
        };

        if (isEdit) {
          await updateUser.mutateAsync({
            id: values._id,
            data: userData,
          });
          setSuccess("User updated successfully!");
        } else {
          await createUser.mutateAsync(userData);
          setSuccess("User created successfully!");
        }
      }

      resetForm();
      setTimeout(() => {
        setIsFormOpen(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Error saving user:", err);
      if (err.response?.data?.error?.includes("duplicate key error")) {
        if (err.response.data.error.includes("email")) {
          setError("This email is already registered.");
        } else if (err.response.data.error.includes("phone")) {
          setError("This phone number is already registered.");
        } else {
          setError("This record already exists.");
        }
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to save. Please try again.");
      }
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      if (type === "doctor") {
        await deleteDoctor.mutateAsync(id);
      } else {
        await deleteUser.mutateAsync(id);
      }
      setSuccess(`${type} deleted successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`Failed to delete ${type}`);
      setTimeout(() => setError(""), 3000);
    }
  };

  if (isLoading)
    return (
      <Layout>
        <div className="p-6">Loading...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-(--primary)">
            User Management
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            Manage doctors and receptionists in your system
          </p>
        </div>

        {success && (
          <div className="p-3 md:p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md mb-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-green-500 mr-2 md:mr-3 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs md:text-sm font-medium text-green-800">
                {success}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 md:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md mb-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-red-500 mr-2 md:mr-3 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs md:text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 md:p-6 bg-linear-to-r from-blue-50 to-indigo-50 border-b">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-(--primary)">
                Doctors
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {doctors.length} doctor(s) registered
              </p>
            </div>

            <button
              onClick={() => openAddForm("doctor")}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-blue-500 text-white text-sm md:text-base rounded-lg hover:opacity-90 transition shadow-md whitespace-nowrap w-full sm:w-auto justify-center"
            >
              <FaPlus /> <span className="hidden sm:inline">Add Doctor</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 md:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="p-2 md:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                    Email
                  </th>
                  <th className="p-2 md:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                    Phone
                  </th>
                  <th className="p-2 md:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Department
                  </th>
                  <th className="p-2 md:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                    Specialization
                  </th>
                  <th className="p-2 md:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">
                    Experience
                  </th>
                  <th className="p-2 md:p-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {doctors.map((doctor) => (
                  <tr
                    key={doctor._id}
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="p-2 md:p-4 font-medium text-gray-900 text-sm md:text-base">
                      {doctor.user?.name || "N/A"}
                    </td>
                    <td className="p-2 md:p-4 text-gray-600 text-sm md:text-base hidden md:table-cell">
                      {doctor.user?.email || "N/A"}
                    </td>
                    <td className="p-2 md:p-4 text-gray-600 text-sm md:text-base hidden lg:table-cell">
                      {doctor.user?.phone || "N/A"}
                    </td>
                    <td className="p-2 md:p-4 text-gray-600 text-sm md:text-base">
                      {doctor.department || "N/A"}
                    </td>
                    <td className="p-2 md:p-4 text-gray-600 text-sm md:text-base hidden sm:table-cell">
                      {doctor.specialization || "N/A"}
                    </td>
                    <td className="p-2 md:p-4 text-gray-600 text-sm md:text-base hidden xl:table-cell">
                      {doctor.experience ? `${doctor.experience} yrs` : "N/A"}
                    </td>

                    <td className="p-2 md:p-4">
                      <div className="flex justify-end gap-1 md:gap-2">
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="flex items-center gap-1 px-2 md:px-4 py-1 md:py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors font-medium text-xs md:text-sm"
                        >
                          <FaEdit />{" "}
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        <button
                          onClick={() => handleDelete(doctor._id, "doctor")}
                          className="flex items-center gap-1 px-2 md:px-4 py-1 md:py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 transition-colors font-medium text-xs md:text-sm"
                        >
                          <FaTrash />{" "}
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {doctors.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center p-8 md:p-12">
                      <div className="flex flex-col items-center justify-center">
                        <FaUserMd className="text-4xl md:text-6xl text-gray-300 mb-3 md:mb-4" />
                        <p className="text-sm md:text-base text-gray-500 font-medium">
                          No doctors found
                        </p>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">
                          Click "Add Doctor" to create one
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 md:p-6 bg-linear-to-r from-green-50 to-emerald-50 border-b">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-(--primary)">
                Receptionists
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {receptionists.length} receptionist(s) registered
              </p>
            </div>

            <button
              onClick={() => openAddForm("receptionist")}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-blue-500 text-white text-sm md:text-base rounded-lg hover:opacity-90 transition shadow-md whitespace-nowrap w-full sm:w-auto justify-center"
            >
              <FaPlus />{" "}
              <span className="hidden sm:inline">Add Receptionist</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 md:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="p-2 md:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                    Email
                  </th>
                  <th className="p-2 md:p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                    Phone
                  </th>
                  <th className="p-2 md:p-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {receptionists.map((rec) => (
                  <tr
                    key={rec._id}
                    className="border-b border-gray-100 hover:bg-green-50/30 transition-colors"
                  >
                    <td className="p-2 md:p-4 font-medium text-gray-900 text-sm md:text-base">
                      {rec.name}
                    </td>
                    <td className="p-2 md:p-4 text-gray-600 text-sm md:text-base hidden md:table-cell">
                      {rec.email}
                    </td>
                    <td className="p-2 md:p-4 text-gray-600 text-sm md:text-base hidden lg:table-cell">
                      {rec.phone}
                    </td>

                    <td className="p-2 md:p-4">
                      <div className="flex justify-end gap-1 md:gap-2">
                        <button
                          onClick={() => handleEdit(rec)}
                          className="flex items-center gap-1 px-2 md:px-4 py-1 md:py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors font-medium text-xs md:text-sm"
                        >
                          <FaEdit />{" "}
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        <button
                          onClick={() => handleDelete(rec._id, "receptionist")}
                          className="flex items-center gap-1 px-2 md:px-4 py-1 md:py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 transition-colors font-medium text-xs md:text-sm"
                        >
                          <FaTrash />{" "}
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {receptionists.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center p-8 md:p-12">
                      <div className="flex flex-col items-center justify-center">
                        <FaUserMd className="text-4xl md:text-6xl text-gray-300 mb-3 md:mb-4" />
                        <p className="text-sm md:text-base text-gray-500 font-medium">
                          No receptionists found
                        </p>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">
                          Click "Add Receptionist" to create one
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg md:max-w-xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center bg-linear-to-r from-blue-600 to-indigo-600 text-white p-4 md:p-6 rounded-t-xl sticky top-0">
                <h3 className="text-lg md:text-xl font-bold">
                  {isEdit ? "Edit Staff" : "Add New Staff Member"}
                </h3>

                <button
                  onClick={() => setIsFormOpen(false)}
                  className="hover:bg-white/20 rounded-full p-1 transition-colors shrink-0"
                >
                  <IoClose size={24} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-4 md:p-6 space-y-4 md:space-y-5"
              >
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={values.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 md:p-3 text-sm md:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={values.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 md:p-3 text-sm md:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={isEdit}
                  />
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={values.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 md:p-3 text-sm md:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={isEdit}
                  />
                </div>

                {values.role === "doctor" && (
                  <>
                    <div>
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        placeholder="e.g., Cardiology"
                        value={values.department}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 md:p-3 text-sm md:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">
                        Qualification
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        placeholder="e.g., MBBS, MD"
                        value={values.qualification}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 md:p-3 text-sm md:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        placeholder="Enter specialization"
                        value={values.specialization}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 md:p-3 text-sm md:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        name="experience"
                        placeholder="Enter years of experience"
                        value={values.experience}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-2 md:p-3 text-sm md:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder={
                      isEdit ? "Leave blank to keep current" : "Enter password"
                    }
                    value={values.password}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 md:p-3 text-sm md:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!isEdit}
                  />
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">
                    Role
                  </label>
                  <select
                    name="role"
                    value={values.role}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 md:p-3 text-sm md:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={isEdit}
                  >
                    <option value="">Select Role</option>
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createUser.isPending || updateUser.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm md:text-base rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {createUser.isPending || updateUser.isPending ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave /> {isEdit ? "Update" : "Save"}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-sm md:text-base rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
