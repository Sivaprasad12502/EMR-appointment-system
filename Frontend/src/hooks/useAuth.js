import { useContext } from "react";
import { Context } from "../context/UseContex";
import { useMutation } from "@tanstack/react-query";
import { loginUserApi, logoutApi, registerUserApi } from "../api/authApi";

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
      });
      navigate(next);
    },
    onError: (error) => {
      console.log(error.response.data);
    },
  });
};
export const useLogoutUser=()=>{
  return useMutation({
    mutationFn:logoutApi,
    onSuccess:()=>{
      localStorage.clear()
      console.log("logged out successfully")

    },
    onError:(error)=>{
      console.log(error.response.data)
    }
  })
}
