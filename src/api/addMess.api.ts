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
export const uploadCoverImage = async (
  messId: string,
  file: File
) => {
   console.log("Uploading cover for:", messId);
 
  const formData = new FormData();
  formData.append("file", file);

 return api.post(
  `/mess/${messId}/cover/image`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);
}
// 🔥 CREATE PLAN API
export const createPlan = async (data: any) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key !== "planImages" && key !== "variationIds") {
      formData.append(key, String(value));
    }
  });

  // 🔥 variationIds as JSON string like your screenshot
  formData.append("variationIds", JSON.stringify(data.variationIds));

  if (data.planImages && data.planImages.length > 0) {
  data.planImages.forEach((file: File) => {
    formData.append("planImages", file);
  });
}



  return api.post("/plans", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
