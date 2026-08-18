import api from "./axios";

export const getMessOwners = (
  page = 1,
  limit = 7,
  search?: string
) => {
  return api.get("/mess-admin", {
    params: {
      page,
      limit,
      ...(search && { search }),
    },
  });
};

export const sendMessOwnerOtp = (payload: {
  name: string;
  email: string;
  phone: string;
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
