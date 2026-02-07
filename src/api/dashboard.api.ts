import api from "./axios";

export interface DashboardStats{
  totalRevenue: number;
  completedOrders: number;
  totalOrders: number;
  totalCustomers: number;
  totalPartners: number;
  activePartners: number;
  avgPerCustomer: number;
  pendingRevenue: number;
  todaysRevenue: number;
  messesCount: number;
}


export const getDashboardStats = () => {
  return api.get("/auth/stats");
};

export const getTodaysRevenue = (date1: string) => {
  return api.get("/auth/stats", {
    params: { date1 },
  });
};

export const getStatsByDateRange = (
  date1: string,
  date2: string
) => {
  return api.get("/auth/stats", {
    params: { date1, date2 },
  });
};