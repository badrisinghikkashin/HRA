import API from "./axiosInstance";

export const getEmployees = () =>
  API.get("auth/employees");

export const addEmployee = (data) =>
  API.post("/register-employee", data);