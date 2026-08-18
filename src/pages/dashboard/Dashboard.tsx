import { useEffect, useState, useCallback } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  LuCalendar,
  LuChevronDown,
  LuClock,
  LuIndianRupee,
  LuRefreshCw,
  LuStore,
  LuTrendingUp,
  LuTruck,
  LuUsers,
} from "react-icons/lu";
import {
  getDashboardStats,
  getStatsByDateRange,
  getStatsByDates,
  getMonthlyRevenue,
  type DashboardStats,
} from "../../services/dashboard.api";
import styles from "./Dashboard.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterMode = "all" | "month" | "custom";
interface MonthRevenue { month: string; revenue: number }

// ─── Constants ────────────────────────────────────────────────────────────────
const YEAR = new Date().getFullYear();
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_DAYS  = ["31","28","31","30","31","30","31","31","30","31","30","31"];

// ─── Helper: safely extract data ─────────────────────────────────────────────
// Handles both res.data (direct) and res.data.data (nested wrapper)
function extractData<T>(res: any): T {
  const d = res?.data;
  if (d && typeof d === "object" && "data" in d && d.data !== null && typeof d.data === "object") {
    return d.data as T;
  }
  return d as T;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
  sub?: string;
}
const StatCard = ({ title, value, icon, accent = "#16a34a", sub }: StatCardProps) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ background: `${accent}18`, color: accent }}>
      {icon}
    </div>
    <div className={styles.statContent}>
      <p className={styles.statTitle}>{title}</p>
      <p className={styles.statValue}>{value}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue}>₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
      </div>
    );
  }
  return null;
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats,          setStats]          = useState<DashboardStats | null>(null);
  const [filteredStats,  setFilteredStats]  = useState<DashboardStats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthRevenue[]>([]);
  const [statsLoading,   setStatsLoading]   = useState(true);
  const [chartLoading,   setChartLoading]   = useState(true);
  const [filterLoading,  setFilterLoading]  = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  // Filter state
  const [filterMode,    setFilterMode]    = useState<FilterMode>("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");
  const [filterOpen,    setFilterOpen]    = useState(false);

  // ── Load stats (critical path — shown first) ──────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setError(null);
    try {
      const res  = await getDashboardStats();
      const data = extractData<DashboardStats>(res);
      console.log("[Dashboard] stats received:", data);
      setStats(data);
      setFilteredStats(data);
    } catch (e: any) {
      console.error("[Dashboard] stats failed:", e);
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to load dashboard stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Load chart separately (12 requests — non-blocking) ───────────────────
  const loadChart = useCallback(async () => {
    setChartLoading(true);
    try {
      const chart = await getMonthlyRevenue(YEAR);
      setMonthlyRevenue(chart);
    } catch (e) {
      console.error("[Dashboard] chart failed:", e);
      // Non-fatal — chart stays empty, rest of dashboard still works
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadChart(); // fires in parallel, doesn't block stats display
  }, []);

  // ── Apply filter ──────────────────────────────────────────────────────────
  const applyFilter = useCallback(async () => {
    setFilterLoading(true);
    try {
      if (filterMode === "all") {
        const res = await getDashboardStats();
        setFilteredStats(extractData<DashboardStats>(res));
        loadChart();
      } else if (filterMode === "month") {
        const mm  = String(selectedMonth + 1).padStart(2, "0");
        const dd  = MONTH_DAYS[selectedMonth];
        const res = await getStatsByDateRange(`${YEAR}/${mm}/01`, `${YEAR}/${mm}/${dd}`);
        setFilteredStats(extractData<DashboardStats>(res));
      } else if (filterMode === "custom" && dateFrom && dateTo) {
        const res = await getStatsByDates(new Date(dateFrom), new Date(dateTo));
        setFilteredStats(extractData<DashboardStats>(res));
      }
    } catch (e) {
      console.error("[Dashboard] filter failed:", e);
    } finally {
      setFilterLoading(false);
      setFilterOpen(false);
    }
  }, [filterMode, selectedMonth, dateFrom, dateTo, loadChart]);

  // Reset: just restore base stats, no extra request
  const resetFilter = useCallback(() => {
    setFilterMode("all");
    setSelectedMonth(new Date().getMonth());
    setDateFrom("");
    setDateTo("");
    setFilteredStats(stats);
  }, [stats]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const s          = filteredStats ?? stats;
  const isFiltered = filterMode !== "all";

  const filterLabel = () => {
    if (filterMode === "month")                        return `${MONTHS[selectedMonth]} ${YEAR}`;
    if (filterMode === "custom" && dateFrom && dateTo) return `${dateFrom} → ${dateTo}`;
    return "All Time";
  };

  const fmt    = (n: number | undefined) => Number(n ?? 0).toLocaleString("en-IN");
  const fmtRs  = (n: number | undefined) => `₹${fmt(n)}`;

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={styles.loader}>
        <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: 12 }}>⚠ {error}</p>
        <button className={styles.applyBtn} onClick={loadStats}>Retry</button>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (statsLoading) {
    return (
      <div className={styles.loader}>
        <div className={styles.loaderSpinner} />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  // ── Empty state (stats loaded but null — shouldn't happen normally) ───────
  if (!s) {
    return (
      <div className={styles.loader}>
        <p style={{ color: "#6b7280" }}>No data available.</p>
        <button className={styles.applyBtn} style={{ marginTop: 12 }} onClick={loadStats}>Retry</button>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className={styles.wrapper}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>
            {isFiltered ? `Showing: ${filterLabel()}` : "All-time overview"}
          </p>
        </div>

        <div className={styles.filterBar}>
          {isFiltered && (
            <button className={styles.resetBtn} onClick={resetFilter}>
              <LuRefreshCw size={14} /> Reset
            </button>
          )}
          <div className={styles.filterDropdown}>
            <button className={styles.filterTrigger} onClick={() => setFilterOpen(v => !v)}>
              <LuCalendar size={15} />
              <span>{filterLabel()}</span>
              <LuChevronDown size={14} className={filterOpen ? styles.chevronOpen : ""} />
            </button>

            {filterOpen && (
              <div className={styles.filterPanel}>
                <div className={styles.modeTabs}>
                  {(["all", "month", "custom"] as FilterMode[]).map(m => (
                    <button
                      key={m}
                      className={`${styles.modeTab} ${filterMode === m ? styles.modeTabActive : ""}`}
                      onClick={() => setFilterMode(m)}
                    >
                      {m === "all" ? "All Time" : m === "month" ? "By Month" : "Custom Range"}
                    </button>
                  ))}
                </div>

                {filterMode === "month" && (
                  <div className={styles.monthGrid}>
                    {MONTH_SHORT.map((mo, i) => (
                      <button
                        key={mo}
                        className={`${styles.monthChip} ${selectedMonth === i ? styles.monthChipActive : ""}`}
                        onClick={() => setSelectedMonth(i)}
                      >
                        {mo}
                      </button>
                    ))}
                  </div>
                )}

                {filterMode === "custom" && (
                  <div className={styles.dateRange}>
                    <div className={styles.dateField}>
                      <label>From</label>
                      <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={styles.dateInput} />
                    </div>
                    <div className={styles.dateSep}>→</div>
                    <div className={styles.dateField}>
                      <label>To</label>
                      <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={styles.dateInput} />
                    </div>
                  </div>
                )}

                <button
                  className={styles.applyBtn}
                  onClick={applyFilter}
                  disabled={filterLoading || (filterMode === "custom" && (!dateFrom || !dateTo))}
                >
                  {filterLoading ? "Applying…" : "Apply Filter"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.grid}>
        <StatCard title="Total Messes"      icon={<LuStore size={20}/>}       accent="#16a34a" value={Number(s.messesCount    ?? 0).toLocaleString()} />
        <StatCard title="Total Customers"   icon={<LuUsers size={20}/>}       accent="#0d9488" value={Number(s.totalCustomers ?? 0).toLocaleString()} />
        <StatCard title="Delivery Partners" icon={<LuTruck size={20}/>}       accent="#64748b" value={Number(s.totalPartners  ?? 0).toLocaleString()} sub={`${s.activePartners ?? 0} active`} />
        <StatCard title="Total Revenue"     icon={<LuIndianRupee size={20}/>} accent="#16a34a" value={fmtRs(s.totalRevenue)} />
        <StatCard title="Pending Revenue"   icon={<LuClock size={20}/>}       accent="#d97706" value={fmtRs(s.pendingRevenue)} />
        <StatCard title="Today's Revenue"   icon={<LuTrendingUp size={20}/>}  accent="#16a34a" value={fmtRs(s.todaysRevenue)} />
      </div>

      {/* ── Chart ── */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Monthly Revenue</h3>
            <p className={styles.chartSub}>{YEAR} overview</p>
          </div>
          {chartLoading && <div className={styles.miniSpinner} />}
        </div>

        {chartLoading ? (
          <div className={styles.chartPlaceholder}>
            <div className={styles.loaderSpinner} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis
                width={70}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v =>
                  v >= 100000 ? `₹${(v/100000).toFixed(1)}L`
                  : v >= 1000  ? `₹${(v/1000).toFixed(0)}k`
                  : `₹${v}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#16a34a"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                dot={{ r: 4, fill: "#16a34a", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#1b4332", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Summary Row ── */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Completed Orders</p>
          <p className={styles.summaryVal}>{s.completedOrders ?? 0}</p>
          <p className={styles.summaryMeta}>of {s.totalOrders ?? 0} total</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Completion Rate</p>
          <p className={styles.summaryVal} style={{ color: "#16a34a" }}>
            {s.totalOrders ? `${Math.round(((s.completedOrders ?? 0) / s.totalOrders) * 100)}%` : "0%"}
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: s.totalOrders ? `${((s.completedOrders ?? 0) / s.totalOrders) * 100}%` : "0%" }}
            />
          </div>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Avg. per Customer</p>
          <p className={styles.summaryVal}>₹{Math.round(s.avgPerCustomer ?? 0).toLocaleString("en-IN")}</p>
          <p className={styles.summaryMeta}>lifetime value</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Active Partners</p>
          <p className={styles.summaryVal}>{s.activePartners ?? 0}</p>
          <p className={styles.summaryMeta}>of {s.totalPartners ?? 0} total</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;