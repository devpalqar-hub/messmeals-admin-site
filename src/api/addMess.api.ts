import api from "./axios";

export interface CreateMessPayload {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  is_premium:boolean;
  location: string;
  districtId?: string;
  openingHours: any;
  messAdminIds: string[];
  foodTypes: string[];
  tags: string[];
  files: File[];
}

export const createMess = async (data: any) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (
      key !== "files" &&
      key !== "foodTypes" &&
      key !== "tags" &&
      key !== "messAdminIds" &&
      key !== "openingHours"
    ) {
      formData.append(key, String(value));
    }
  });

  // 🔥 Send arrays properly
  data.foodTypes.forEach((type: string) =>
    formData.append("foodTypes[]", type)
  );

  data.tags.forEach((tag: string) =>
    formData.append("tags[]", tag)
  );

  if (data.messAdminIds && data.messAdminIds.length > 0) {
    data.messAdminIds.forEach((id: string) =>
      formData.append("messAdminIds[]", id)
    );
  }

  formData.append("openingHours", JSON.stringify(data.openingHours));

  data.files.forEach((file: File) => {
  formData.append("files", file, file.name);
});

  return api.post("/mess", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

};
