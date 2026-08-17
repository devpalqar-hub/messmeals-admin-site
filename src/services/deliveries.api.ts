import api from "./axios";
import type {
  DeliveryListResponse,
  DeliveryDetailResponse,
  DeliveryStatus,
} from "../types/delivery.types";

export const getDeliveries = (
  page: number,
  limit: number,
  status?: DeliveryStatus | "ALL",
  date?: string,
  messId?: string,
  partnerId?: string,
  search?: string
) => {
  const params: any = { page, limit };
  if (status) params.status = status;
  if (date) params.date = date;
  if (messId) params.messId = messId;
  if (partnerId) params.partnerId = partnerId;
  if (search) params.search = search;

  return api.get<DeliveryListResponse>("/deliveries", { params });
};

export const getDeliveryById = (id: string) => {
  return api.get<DeliveryDetailResponse>(`/deliveries/${id}`);
};

export const updateDeliveryStatus = (id: string, status: DeliveryStatus) => {
  return api.patch(`/deliveries/${id}`, { status });
};
