import API from "./axiosInstance";

export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

export const registerEmployee = (data) => {
  return API.post("/auth/register-employees", data);
};

