export interface Mess {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

export interface MessAdminProfile {
  id: string;
  messes: Mess[];
}

export interface MessOwner {
  id: string;
  name: string;
  phone: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  messAdminProfile?: MessAdminProfile;
}

export interface MessOwnerMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MessOwnersResponse {
  data: MessOwner[];
  meta: MessOwnerMeta;
}

export interface SendOtpPayload {
  name: string;
  email: string;
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  sessionId: string;
  otp: string;
}