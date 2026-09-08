import api from "./axios";
import type {
  CreateMessWithOwnerPayload,
  CreateMessWithOwnerResponse,
} from "../types/messOwner.types";

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

/**
 * Superadmin direct-create flow: creates the mess owner (MESSADMIN) account first,
 * then creates the mess linked to that owner — in one call, no OTP required.
 */
export const createMessWithOwner = (payload: CreateMessWithOwnerPayload) => {
  return api.post<CreateMessWithOwnerResponse>("/auth/superadmin/mess", payload);
};
