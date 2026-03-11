import axiosClient from "./axiosClient";

export const bookAppointment = async (appointmentData) => {
  const response = await axiosClient.post("/appointments", appointmentData);
  return response.data;
};

export const getAppointments = async (params = {}) => {
  const response = await axiosClient.get("/appointments", { params });
  return response.data;
};

export const getAppointmentById = async (id) => {
  const response = await axiosClient.get(`/appointments/${id}`);
  return response.data;
};

export const updateAppointment = async (id, updateData) => {
  const response = await axiosClient.put(`/appointments/${id}`, updateData);
  return response.data;
};

export const deleteAppointment = async (id) => {
  const response = await axiosClient.delete(`/appointments/${id}`);
  return response.data;
};

export const markAsArrived = async (id) => {
  const response = await axiosClient.post(`/appointments/${id}/arrive`);
  return response.data;
};

export const getAppointmentStats = async (params = {}) => {
  const response = await axiosClient.get("/appointments/stats", { params });
  return response.data;
};

export default {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  markAsArrived,
  getAppointmentStats,
};
