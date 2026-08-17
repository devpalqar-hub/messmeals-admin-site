import api from "./axios";

/**
 * Upload any image/file to S3
 * @param file File
 * @param path optional backend path (future-proof)
 */
export const uploadFile = async (
  file: File,
  path: string = "/s3/upload"
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(path, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Handle different response structures
  const url = res.data?.data?.url || res.data?.url || res.data;
  
  if (!url || typeof url !== "string") {
    console.error("Upload response:", res.data);
    throw new Error("Invalid response from upload service");
  }

  return url;
};