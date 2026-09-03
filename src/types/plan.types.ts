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
  /** Optional — links this plan to one or more existing menus of the same mess. */
  menuIds?: string[];
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
  /** Optional — replaces the full set of menus linked to this plan. Pass [] to unlink all. */
  menuIds?: string[];
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
  menus?: Array<{ id: string; name: string }>;
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
