import api from "./axios";
import { uploadFile } from "./upload.service";
import type { CreatePlanPayload, UpdatePlanPayload, PlanResponse, PlansListResponse } from "../types/plan.types";

/**
 * Create a new plan with JSON body
 * Uploads plan images to S3 first, then creates plan with image URLs
 */
export const createPlan = async (data: {
  planName: string;
  price: number | string;
  minPrice?: number | string;
  description: string;
  messId: string;
  variationIds: string[];
  isMonthlyPlan: boolean;
  isDailyPlan: boolean;
  planImages?: File[];
}): Promise<PlanResponse> => {
  // Upload plan images to S3
  let imageUrls: Array<{ url: string }> = [];

  if (data.planImages && data.planImages.length > 0) {
    const uploadedUrls = await Promise.all(
      data.planImages.map((file) => uploadFile(file))
    );
    imageUrls = uploadedUrls.map((url) => ({ url }));
  }

  // Build JSON payload
  const payload: CreatePlanPayload = {
    planName: data.planName,
    price: typeof data.price === "string" ? parseInt(data.price) : data.price,
    minPrice: data.minPrice ? (typeof data.minPrice === "string" ? parseInt(data.minPrice) : data.minPrice) : undefined,
    description: data.description,
    messId: data.messId,
    variationIds: data.variationIds,
    isMonthlyPlan: data.isMonthlyPlan,
    isDailyPlan: data.isDailyPlan,
    images: imageUrls.length > 0 ? imageUrls : undefined,
  };

  return api.post("/plans", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Update an existing plan with JSON body
 */
export const updatePlan = async (
  planId: string,
  data: {
    planName: string;
    price: number | string;
    minPrice?: number | string;
    description: string;
    variationIds: string[];
    isMonthlyPlan: boolean;
    isDailyPlan: boolean;
  }
): Promise<PlanResponse> => {
  const payload: UpdatePlanPayload = {
    planName: data.planName,
    price: typeof data.price === "string" ? parseInt(data.price) : data.price,
    minPrice: data.minPrice ? (typeof data.minPrice === "string" ? parseInt(data.minPrice) : data.minPrice) : undefined,
    description: data.description,
    variationIds: data.variationIds,
    isMonthlyPlan: data.isMonthlyPlan,
    isDailyPlan: data.isDailyPlan,
  };

  return api.patch(`/plans/${planId}`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Get a single plan by ID
 */
export const getPlanById = (planId: string): Promise<PlanResponse> => {
  return api.get(`/plans/${planId}`);
};

/**
 * Get all plans for a mess
 */
export const getPlansByMessId = (
  messId: string,
  page?: number,
  limit?: number
): Promise<PlansListResponse> => {
  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));

  return api.get(`/mess/${messId}/plans?${params.toString()}`);
};

/**
 * Delete a plan
 */
export const deletePlan = (planId: string) => {
  return api.delete(`/plans/${planId}`);
};

/**
 * Add images to an existing plan
 */
export const addPlanImages = async (
  planId: string,
  files: File[]
): Promise<PlanResponse> => {
  // Upload images to S3
  const uploadedUrls = await Promise.all(
    files.map((file) => uploadFile(file))
  );

  const payload = {
    images: uploadedUrls.map((url) => ({ url })),
  };

  return api.post(`/plans/${planId}/plan/images`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Remove an image from a plan
 */
export const removePlanImage = (planId: string, imageId: string) => {
  return api.delete(`/plans/${planId}/gallery/images/${imageId}`);
};
