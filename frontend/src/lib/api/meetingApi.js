import API from "./axiosInstance";

// Admin → mark employee absent
export const markNotAttended = (data) => {
  return API.post("meeting/mark-not-attended", data);
};

// Employee → own missed meetings
export const getMyMissedMeetings = () => {
  return API.get("meeting/my-missed");
};

