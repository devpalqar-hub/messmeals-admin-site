export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Customer {
  id: string;
  walletAmount: string;
  address: string;
  current_location: string;
  latitude_logitude: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Mess {
  id: string;
  name: string;
  description?: string;
  features?: string;
  address?: string;
  phone: string;
  email: string;
  isPremium: boolean;
  is_active: boolean;
  latitude?: string;
  logitude?: string;
  is_verified: boolean;
  openingHours?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  districtId: string;
}

export interface Plan {
  id: string;
  planName: string;
  price: string;
  minPrice?: string;
  description?: string;
  messId: string;
  createdAt: string;
  updatedAt: string;
  isMonthlyPlan: boolean;
  isDailyPlan: boolean;
  isActive: boolean;
}

export interface DeliveryPartner {
  id: string;
  deliveryCounts: number | null;
  deliveryRegion: string;
  isonline: boolean;
  address: string | null;
  userId: string;
  messId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export type DeliveryStatus = "PENDING" | "PROGRESS" | "DELIVERED";

export interface Delivery {
  id: string;
  date: string;
  status: DeliveryStatus;
  action: string | null;
  customerId: string;
  planId: string;
  partnerId: string;
  messId: string;
  subscriptionId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  customer?: Customer;
  mess?: Mess;
  plan?: Plan;
  partner?: DeliveryPartner;
}

export interface DeliveryFilters {
  status: "ALL" | DeliveryStatus;
  date?: string | null;
  messId?: string | null;
  partnerId?: string | null;
}

export interface DeliveryListResponse {
  message: string;
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  filters: DeliveryFilters;
  data: Delivery[];
}

export interface DeliveryDetailResponse {
  id: string;
  date: string;
  status: DeliveryStatus;
  action: string | null;
  customerId: string;
  planId: string;
  partnerId: string;
  messId: string;
  subscriptionId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  customer: Customer;
  mess: Mess;
  plan: Plan;
  partner: DeliveryPartner;
}
