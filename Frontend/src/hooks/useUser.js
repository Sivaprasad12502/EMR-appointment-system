import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createUserApi,
  getAllUsersApi,
  updateUserApi,
  deleteUserApi,
  getAllDoctorsApi,
  updateDoctorApi,
  deleteDoctorApi,

} from "../api/usersApi";

export const useAllUsers = () => {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: getAllUsersApi,
  });
};
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["all-users"]);
      queryClient.invalidateQueries(["all-doctors"]);
    },
    onError: (error) => {
      console.log(error.response.data);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["all-users"]);
    },
    onError: (error) => {
      console.log(error.response.data);
    },
  });
};
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["all-users"]);
    },
    onError: (error) => {
      console.log(error.response.data);
    },
  });
};
export const useAllDoctors = () => {
  return useQuery({
    queryKey: ["all-doctors"],
    queryFn: getAllDoctorsApi,
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDoctorApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["all-doctors"]);
      queryClient.invalidateQueries(["all-users"]);
    },
    onError: (error) => {
      console.log(error.response.data);
    },
  });
};
export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDoctorApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["all-doctors"]);
      queryClient.invalidateQueries(["all-users"]);
    },
    onError: (error) => {
      console.log(error.response.data);
    },
  });
};