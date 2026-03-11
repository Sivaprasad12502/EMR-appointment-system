import axiosClient from "./axiosClient";

export const registerUserApi = async (userData) => {
  const res = await axiosClient.post("/auth/register", userData);
  return res.data;
};

export const loginUserApi = async (data) => {
  const res = await axiosClient.post("/auth/login", data);
  return res.data;
};

export const refrshTokenApi = async () => {
  const refresh = localStorage.getItem("refreshToken");
  const res = await axiosClient.post("/auth/refresh-token", {
    refreshToken: refresh,
  });
  return res.data;
};

export const getMeApi = async () => {
  const res = await axiosClient.get("/auth/me");
  return res.data;
};

export default {
  registerUserApi,
  loginUserApi,
  refrshTokenApi,
  getMeApi,
};
