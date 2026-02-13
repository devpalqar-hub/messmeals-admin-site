import api from "./axios";

export const getMessOwners = (page = 1, limit = 10) => {
  return api.get("/mess-admin", {
    params: {
      role: "MESSADMIN",
      page,
      limit,
    },
  });
};

export const sendMessOwnerOtp = (payload: {
  name: string;
  email: string;
  phone: string;
  messId: string;
}) => {
  return api.post("/auth/send-reg-otp", payload);
};

export const verifyMessOwnerOtp = (data: {
  phone: string;
  sessionId: string;
  otp: string;
}) => {
  return api.post("/auth/verify-otp", data);
};
