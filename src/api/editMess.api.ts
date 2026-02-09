import api from "./axios";

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
}

export const updateMess = async (
  id: string,
  data: UpdateMessPayload
) => {
  return api.patch(`/mess/${id}`, data);
};
export const updateMessImages = (id: string, files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return api.post(
    `/mess/${id}/gallery/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


export const deleteMessImage = (messId: string, imageId: string) => {
  return api.delete(
    `/mess/${messId}/gallery/images/${imageId}`
  );
};
