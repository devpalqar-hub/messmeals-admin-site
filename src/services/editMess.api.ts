import api from "./axios";
import { uploadFile } from "./upload.service";
import type { UpdateMessPayload } from "../types/mess.types";

export const updateMess = async (
  id: string,
  data: UpdateMessPayload
) => {
  return api.patch(`/mess/${id}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Upload gallery images to S3 and add them to mess with JSON body
 */
export const updateMessImages = async (id: string, files: File[]) => {
  // Upload all images to S3
  const uploadedUrls = await Promise.all(
    files.map((file) => uploadFile(file))
  );

  const imagePayload = {
    images: uploadedUrls.map((url) => ({ url })),
  };

  return api.post(
    `/mess/${id}/gallery/images`,
    imagePayload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

/**
 * Upload cover image to S3 and update mess
 */
export const updateMessCoverImage = async (id: string, file: File) => {
  // Upload to S3
  const url = await uploadFile(file);

  return api.patch(`/mess/${id}/cover/image`, { url }, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const deleteMessImage = (messId: string, imageId: string) => {
  return api.delete(
    `/mess/${messId}/gallery/images/${imageId}`
  );
};

/**
 * Update a plan with JSON body
 */
export const updatePlan = async (
  id: string,
  data: {
    planName: string;
    price: number;
    minPrice?: number;
    description: string;
    variationIds: string[];
    isMonthlyPlan: boolean;
    isDailyPlan: boolean;
  }
) => {
  return api.patch(`/plans/${id}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
