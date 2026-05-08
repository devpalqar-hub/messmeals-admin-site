import api from "./axios";
import { uploadFile } from "./upload.service";
import type { CreateMessPayload } from "../types/mess.types";

/**
 * Create a new mess with JSON body
 * Uploads gallery images to S3 first, then creates mess with image URLs
 */
export const createMess = async (data: {
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
  files?: File[];
}) => {
  // Upload gallery images to S3
  let imageUrls: Array<{ url: string }> = [];

  if (data.files && data.files.length > 0) {
    const uploadedUrls = await Promise.all(
      data.files.map((file) => uploadFile(file))
    );
    imageUrls = uploadedUrls.map((url) => ({ url }));
  }

  // Build JSON payload
  const payload: CreateMessPayload = {
    name: data.name,
    description: data.description,
    address: data.address,
    phone: data.phone,
    email: data.email,
    is_active: data.is_active,
    is_verified: data.is_verified,
    isPremium: data.isPremium,
    location: data.location,
    districtId: data.districtId,
    openingHours: data.openingHours,
    messAdminIds: data.messAdminIds,
    foodTypes: data.foodTypes,
    tags: data.tags,
    features: data.features,
    images: imageUrls.length > 0 ? imageUrls : undefined,
  };

  return api.post("/mess", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Upload cover image to S3 and update mess with JSON body
 */
export const uploadCoverImage = async (
  messId: string,
  file: File
) => {
  console.log("Uploading cover for:", messId);

  // Upload to S3
  const url = await uploadFile(file);

  // Update mess with JSON body
  return api.patch(
    `/mess/${messId}/cover/image`,
    { url },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
