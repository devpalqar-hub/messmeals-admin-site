/**
 * Plan Related Types
 */

export interface PlanImage {
  url: string;
}

export interface CreatePlanPayload {
  planName: string;
  price: number;
  minPrice?: number;
  description: string;
  messId: string;
  variationIds: string[];
  isMonthlyPlan: boolean;
  isDailyPlan: boolean;
  images?: PlanImage[];
}

export interface UpdatePlanPayload {
  planName: string;
  price: number;
  minPrice?: number;
  description: string;
  variationIds: string[];
  isMonthlyPlan: boolean;
  isDailyPlan: boolean;
  images?: PlanImage[];
}

export interface Plan {
  id: string;
  planName: string;
  price: number;
  minPrice?: number;
  description: string;
  messId: string;
  isMonthlyPlan: boolean;
  isDailyPlan: boolean;
  createdAt: string;
  updatedAt: string;
  images?: Array<{ id: string; url: string }>;
  Variation?: Array<{ id: string; title: string }>;
}

export interface PlanResponse {
  data: Plan;
  message?: string;
}

export interface PlansListResponse {
  data: Plan[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
