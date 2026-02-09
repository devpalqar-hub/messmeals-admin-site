import api from "./axios";

export interface Mess {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string | null;
  isPremium: boolean;
  is_active: boolean;
  createdAt: string;
}

export interface MessDetails {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  location: string;
  isPremium: boolean;
  is_active: boolean;
  createdAt: string;
  openingHours: Record<string, string>;
  images: { id: string; url: string; isCover: boolean }[];
  messAdmins: MessAdmin[];
  plans: any[];
  DeliveryPartnerProfile: any[];
  UserSubscriptions: any[];
}

export interface MessStats {
  totalRevenue: number;
  completedOrders: number;
  totalOrders: number;
  totalCustomers: number;
  totalPartners: number;
  activePartners: number;
  avgPerCustomer: number;
  pendingRevenue: number;
  todaysRevenue: number;
}
export interface MessAdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface MessAdmin {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: MessAdminUser;
}


export const getMesses = (page: number, limit: number) => {
  return api.get("/mess", {
    params: { page, limit },
  });
};

export const getMessById = (id: string) => {
  return api.get(`/mess/${id}`);
};

export const updateMessStatus = async (id: string, is_active: boolean) => {
  return api.patch(`/mess/${id}`, {
    is_active,
  });
};

export const getMessStats = (
  messId: string,
  date1?: string
) => {
  return api.get<MessStats>("/auth/stats", {
    params: {
      messId,
      ...(date1 && { date1 }), // only add date1 if provided
    },
  });
};