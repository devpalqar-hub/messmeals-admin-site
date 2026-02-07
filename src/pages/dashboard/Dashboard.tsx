import StatCard from "../../components/ui/StatCard/StatCard";
import styles from "./Dashboard.module.css";
import { LuClock, LuIndianRupee, LuStore, LuTrendingUp, LuTruck, LuUsers } from "react-icons/lu";
import { getDashboardStats, getStatsByDateRange, getTodaysRevenue, type DashboardStats } from "../../api/dashboard.api";
import { useEffect, useState } from "react";
import MonthlyRevenueChart from "../../components/charts/MonthlyRevenueChart";

const months = [
  { name: "Jan", start: "01", end: "31" },
  { name: "Feb", start: "02", end: "28" },
  { name: "Mar", start: "03", end: "31" },
  { name: "Apr", start: "04", end: "30" },
  { name: "May", start: "05", end: "31" },
  { name: "Jun", start: "06", end: "30" },
  { name: "Jul", start: "07", end: "31" },
  { name: "Aug", start: "08", end: "31" },
  { name: "Sep", start: "09", end: "30" },
  { name: "Oct", start: "10", end: "31" },
  { name: "Nov", start: "11", end: "30" },
  { name: "Dec", start: "12", end: "31" },
];


const Dashboard = () => {
   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [todaysRevenue, setTodaysRevenue] = useState<number>(0);
   const [loading, setLoading] = useState(true);
   const [monthlyRevenue, setMonthlyRevenue] = useState<
      { month: string; revenue: number }[]
    >([]);

    useEffect(() => {
      fetchStats();
    }, []);

    useEffect(() => {
      fetchStats();
      fetchMonthlyRevenue();
    }, []);


    const fetchMonthlyRevenue = async () => {
      try {
        const year = "2026";

        const results = await Promise.all(
          months.map(async (m) => {
            const res = await getStatsByDateRange(
              `${year}/${m.start}/01`,
              `${year}/${m.start}/${m.end}`
            );

            return {
              month: m.name,
              revenue: res.data.totalRevenue || 0,
            };
          })
        );

        setMonthlyRevenue(results);
      } catch (err) {
        console.error("Failed to load monthly revenue");
      }
    };


    const fetchStats = async () => {
      try {
        setLoading(true);

        // 1️⃣ Get all stats
        const res = await getDashboardStats();
        setStats(res.data);

        // 2️⃣ Get today's revenue
        const today = new Date().toISOString().split("T")[0];
        const todayRes = await getTodaysRevenue(today);
        setTodaysRevenue(todayRes.data.todaysRevenue);

      } catch (err) {
        console.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return <p>Loading dashboard...</p>;
    }


  return (
    <div className={styles.wrapper}>
      
      <div className={styles.grid}>
        <StatCard
          title="Total Messes"
          value={stats ? stats.messesCount.toString() : '0'}
          icon={<LuStore />}
        />

        <StatCard
          title="Total Customers"
          value={stats ? stats.totalCustomers.toString() : '0'}
          icon={<LuUsers />}
        />

        <StatCard
          title="Delivery Partners"
          value={stats ? stats.totalPartners.toString() : '0'}
          icon={<LuTruck />}
        />

        <StatCard
          title="Total Revenue"
          value={stats ? `₹${stats.totalRevenue.toLocaleString()}` : '₹0'}
          icon={<LuIndianRupee />}
        />

        <StatCard
          title="Pending Revenue"
          value={stats ? `₹${stats.pendingRevenue.toLocaleString()}` : '₹0'}
          icon={<LuClock />}
        />

        <StatCard
          title="Today's Revenue"
          value={`₹${todaysRevenue.toLocaleString()}`}
          icon={<LuTrendingUp />}
        />
      </div>

      <div className={styles.chartCard}>
        <h3>Monthly Revenue</h3>
        <MonthlyRevenueChart data={monthlyRevenue} />
      </div>

    </div>
  );
};

export default Dashboard;
