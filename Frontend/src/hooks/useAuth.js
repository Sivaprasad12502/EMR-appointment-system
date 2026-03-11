import { useContext } from "react";
import { Context } from "../context/UseContex";
import { useMutation } from "@tanstack/react-query";
import { loginUserApi, registerUserApi } from "../api/authApi";

export const useRegisterUser = (navigate, next) => {
  const { storeData } = useContext(Context);
  return useMutation({
    mutationFn: registerUserApi,
    onSuccess: (data) => {
      if (data) {
        console.log(data);
      }
    },
  });
};
export const useLoginUser = (navigate, next) => {
  const { storeData } = useContext(Context);
  return useMutation({
    mutationFn: loginUserApi,
    onSuccess: (data) => {
      if (data) {
        console.log(data);
      }
      storeData({
        user: data?.user,
        token: data?.accessToken,
        refresh: data?.refreshToken,
      });
      const role = data?.user?.role;

      
      if (role === "super_admin") {
        navigate("/dashboard");
      } else if (role === "doctor") {
        navigate("/dashboard");
      } else if (role === "receptionist") {
        navigate("/dashboard");
      } else if (role === "patient") {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    },
    onError: (error) => {
      console.log(error.response.data);
    },
  });
};
