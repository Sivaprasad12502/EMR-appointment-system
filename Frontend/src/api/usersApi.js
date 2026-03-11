import axiosClient from "./axiosClient";

export const getAllUsersApi = async () => {
  const res = await axiosClient.get("users");
  return res.data;
};

export const createUserApi = async (data) => {
  const res = await axiosClient.post("users", data);
  return res.data;
};

export const updateUserApi = async (data) => {
  const res = await axiosClient.put(`users/${data.id}`, data);
  return res.data;
};

export const deleteUserApi = async (id) => {
  const res = await axiosClient.delete(`users/${id}`);
  return res.data;
};

export const getAllDoctorsApi = async () => {
  const res = await axiosClient.get("doctors");
  return res.data;
};

export const updateDoctorApi = async (data) => {
  const res = await axiosClient.put(`doctors/${data.id}`, data);
  return res.data;
};

export const deleteDoctorApi = async (id) => {
  const res = await axiosClient.delete(`doctors/${id}`);
  return res.data;
};
