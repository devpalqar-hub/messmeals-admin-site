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

/** Superadmin direct-create: POST /auth/superadmin/mess — creates the mess owner and
 * the mess itself in one call (no OTP). */
export interface CreateMessWithOwnerPayload {
  owner: {
    name: string;
    email: string;
    phone: string;
    password: string;
    is_active?: boolean;
  };
  mess: {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
    is_verified?: boolean;
    isPremium?: boolean;
    location?: string;
    districtId?: string;
    foodTypes?: string[];
    tags?: string[];
    features?: string[];
    zipcode?: string;
  };
  images?: Array<{ url: string }>;
}

export interface CreateMessWithOwnerResponse {
  message: string;
  accessToken: string;
  owner: {
    id: string;
    name: string;
    phone: string;
    email: string;
    role: string;
    is_active: boolean;
  };
  mess: { id: string; [key: string]: any };
  status: number;
}