import axiosClient from "./axiosClient";

export const searchPatients = async (query) => {
  const response = await axiosClient.get("/patients/search", {
    params: { query },
  });
  return response.data;
};

export const getAllPatients = async (params = {}) => {
  const response = await axiosClient.get("/patients", { params });
  return response.data;
};

export const getPatientById = async (id) => {
  const response = await axiosClient.get(`/patients/${id}`);
  return response.data;
};

export const createPatient = async (patientData) => {
  const response = await axiosClient.post("/patients", patientData);
  return response.data;
};

export const updatePatient = async (id, patientData) => {
  const response = await axiosClient.put(`/patients/${id}`, patientData);
  return response.data;
};

export const deletePatient = async (id) => {
  const response = await axiosClient.delete(`/patients/${id}`);
  return response.data;
};

export const getPatientAppointments = async (id, params = {}) => {
  const response = await axiosClient.get(`/patients/${id}/appointments`, {
    params,
  });
  return response.data;
};

export default {
  searchPatients,
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientAppointments,
};
