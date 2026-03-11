import axiosClient from "./axiosClient";

export const getAllDoctors = async (params = {}) => {
  const response = await axiosClient.get("/doctors", { params });
  return response.data;
};

export const getDoctorById = async (id) => {
  const response = await axiosClient.get(`/doctors/${id}`);
  return response.data;
};

export const getDoctorSchedule = async (id) => {
  const response = await axiosClient.get(`/doctors/${id}/schedule`);
  return response.data;
};

export const updateDoctorSchedule = async (id, scheduleData) => {
  const response = await axiosClient.put(
    `/doctors/${id}/schedule`,
    scheduleData,
  );
  return response.data;
};

export const getDoctorSlots = async (id, date) => {
  const response = await axiosClient.get(`/doctors/${id}/slots`, {
    params: { date },
  });
  return response.data;
};

export const getDepartments = async () => {
  const response = await axiosClient.get("/doctors/departments");
  return response.data;
};

export const updateDoctor = async (id, doctorData) => {
  const response = await axiosClient.put(`/doctors/${id}`, doctorData);
  return response.data;
};

export const deleteDoctor = async (id) => {
  const response = await axiosClient.delete(`/doctors/${id}`);
  return response.data;
};

export default {
  getAllDoctors,
  getDoctorById,
  getDoctorSchedule,
  updateDoctorSchedule,
  getDoctorSlots,
  getDepartments,
  updateDoctor,
  deleteDoctor,
};
