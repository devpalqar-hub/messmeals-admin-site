import api from "./axios";

export interface DashboardStats {
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

// ── Date helpers ──────────────────────────────────────────────────────────────

const fmtDate = (d: Date): string =>
  `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")}`;

// ── API calls ─────────────────────────────────────────────────────────────────

/** All-time stats — no date params needed */
export const getDashboardStats = () =>
  api.get<DashboardStats>("/auth/stats");

/** Stats filtered by date range (only called when filters are applied) */
export const getStatsByDateRange = (date1: string, date2: string) =>
  api.get<DashboardStats>("/auth/stats", {
    params: { date1, date2 },
  });

/** Stats for a custom range using JS Date objects */
export const getStatsByDates = (start: Date, end: Date) =>
  getStatsByDateRange(fmtDate(start), fmtDate(end));

/** Stats for a single ISO date string (YYYY-MM-DD) */
export const getTodaysRevenue = (isoDate: string) => {
  const d = isoDate.replace(/-/g, "/");
  return getStatsByDateRange(d, d);
};

// ── Monthly chart data ────────────────────────────────────────────────────────

const MONTH_META = [
  { name: "Jan", mm: "01", days: "31" },
  { name: "Feb", mm: "02", days: "28" },
  { name: "Mar", mm: "03", days: "31" },
  { name: "Apr", mm: "04", days: "30" },
  { name: "May", mm: "05", days: "31" },
  { name: "Jun", mm: "06", days: "30" },
  { name: "Jul", mm: "07", days: "31" },
  { name: "Aug", mm: "08", days: "31" },
  { name: "Sep", mm: "09", days: "30" },
  { name: "Oct", mm: "10", days: "31" },
  { name: "Nov", mm: "11", days: "30" },
  { name: "Dec", mm: "12", days: "31" },
];

export const getMonthlyRevenue = async (
  year: string | number
): Promise<{ month: string; revenue: number }[]> => {
  const results = await Promise.allSettled(
    MONTH_META.map((m) =>
      getStatsByDateRange(`${year}/${m.mm}/01`, `${year}/${m.mm}/${m.days}`)
    )
  );
  return results.map((result, i) => ({
    month: MONTH_META[i].name,
    revenue:
      result.status === "fulfilled"
        ? (result.value.data?.totalRevenue ?? 0)
        : 0,
  }));
};