import api from "./axios";

export interface Mess {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string | null;
  isPremium: boolean;
  is_active: boolean;
  createdAt: string;
}


export const getMesses = (page: number, limit: number) => {
  return api.get("/mess", {
    params: { page, limit },
  });
};
