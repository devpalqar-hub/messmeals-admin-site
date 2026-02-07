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
export const updateMessStatus = async (id: string, is_active: boolean) => {
  return api.patch(`/mess/${id}`, {
    is_active,
  });
};