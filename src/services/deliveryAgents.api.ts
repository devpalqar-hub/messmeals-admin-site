import api from "./axios";

export interface DeliveryPartnerProfile {
  id: string;
  address: string | null;
  deliveryRegion: string | null;
  messId: string;
  isonline?: boolean;
  deliveryCounts?: number | null;
  userId?: string;
}

export interface DeliveryAgentStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  totalEarnings: number;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  deliveryPartnerProfile?: DeliveryPartnerProfile;
  stats?: DeliveryAgentStats;
  createdAt?: string;
  updatedAt?: string;
}

export const getDeliveryAgents = (page: number, limit: number, search?: string) => {
  return api.get("/delivery-agent", {
    params: { page, limit, ...(search && { search }) },
  });
};

export const getDeliveryAgentById = (id: string) => {
  return api.get(`/delivery-agent/${id}`);
};

export const createDeliveryAgent = (payload: {
  name: string;
  phone: string;
  email: string;
  address: string;
  messId: string;
}) => {
  return api.post("/delivery-agent", payload);
};
