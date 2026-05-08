/**
 * Mess Related Types
 */

export interface CreateMessPayload {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  isPremium: boolean;
  location: string;
  districtId: string;
  openingHours: Record<string, string>;
  messAdminIds: string[];
  foodTypes: string[];
  tags: string[];
  features?: string[];
  images?: Array<{ url: string }>;
}

export interface UpdateMessPayload {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  isPremium: boolean;
  location: string;
  districtId: string;
  openingHours: Record<string, string>;
  foodTypes: string[];
  tags: string[];
  features?: string[];
  images?: Array<{ url: string }>;
}

export interface CoverImagePayload {
  url: string;
}

export interface MessDetailsResponse {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  isPremium: boolean;
  location: string;
  districtId: string;
  openingHours?: Record<string, string>;
  features?: string[];
  createdAt: string;
  updatedAt: string;
  messAdmins?: Array<{
    id: string;
    createdAt?: string;
    user?: {
      name: string;
      email: string;
      phone: string;
    };
  }>;
  plans?: any[];
  images?: Array<{ id: string; url: string }>;
  coverImage?: { id: string; url: string };
}

export interface MessStats {
  totalRevenue: number;
  completedOrders: number;
  totalOrders: number;
  pendingRevenue: number;
  todaysRevenue: number;
  totalPartners: number;
  activePartners: number;
}
