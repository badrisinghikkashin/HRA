import API from "./axiosInstance";

// Admin attendance list
export const getAttendance = () => {
  return API.get("/attendance/all");
};

// Employee own attendance
export const getMyAttendance = () => {
  return API.get("/attendance/my");
};

export const checkIn = () => {
  return API.post("/attendance/check-in", {});
};

export const checkOut = () => {
  return API.post("/attendance/check-out", {});
};

export const breakStart = (breakType) => {
  // allow either raw string or object with type/breakType property
  let typeString = "";
  if (typeof breakType === "object" && breakType !== null) {
    typeString = breakType.breakType || breakType.type || "";
  } else {
    typeString = breakType;
  }

  return API.post("/attendance/break-start", {
    breakType: typeString.toUpperCase(),
  });
};

export const breakEnd = () => {
  return API.post("/attendance/break-end", {});
};
