import styles from "./MessDetails.module.css";
import { LuArrowLeft, LuCalendar, LuIndianRupee, LuMail, LuMapPin, LuPackage, LuPackageCheck, LuPencil, LuPhone, LuTrash, LuTruck } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import StatCard from "../../components/ui/StatCard/StatCard";
import { useEffect, useState } from "react";
import { getMessById, getMessStats, type MessDetails, type MessStats } from "../../api/mess.api";

const MessDetails = () => {
const navigate = useNavigate();
const { id } = useParams();
const [mess, setMess] = useState<MessDetails | null>(null);
const [stats, setStats] = useState<MessStats | null>(null);

const [loading, setLoading] = useState(true);

const safeStats = stats ?? {
  totalRevenue: 0,
  completedOrders: 0,
  totalOrders: 0,
  pendingRevenue: 0,
  todaysRevenue: 0,
  totalPartners: 0,
  activePartners: 0,
};


useEffect(() => {
  if (!id) return;

  const fetchAll = async () => {
    try {
      setLoading(true);

      const messRes = await getMessById(id);
      setMess(messRes.data);

      const today = new Date().toISOString().split("T")[0];

      const statsRes = await getMessStats(id, today);
      setStats(statsRes.data);
      console.log("Fetched stats:", statsRes.data);

    } catch (err) {
      console.error("Failed to load mess details or stats", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAll();
}, [id]);


if (loading) return <p>Loading mess details...</p>;
if (!mess) return <p>Mess not found</p>;


  return (
    <div className={styles.wrapper}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.left}>
          <LuArrowLeft onClick={() => navigate(-1)} />
          <h2>{mess.name}</h2>
          <span className={mess.is_active ? styles.active : styles.inactive}>
            {mess.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className={styles.actions}>
          <button className={styles.edit}>
            <LuPencil /> Edit
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        <StatCard
            title="Total Revenue"
            value={`₹${safeStats.totalRevenue.toLocaleString("en-IN")}`}
            icon={<LuIndianRupee />}
          />

          <StatCard
            title="Total Orders"
            value={safeStats.totalOrders.toString()}
            icon={<LuPackage />}
          />

          <StatCard
            title="Completed Orders"
            value={safeStats.completedOrders.toString()}
            icon={<LuPackageCheck />}
          />

          <StatCard
            title="Pending Revenue"
            value={`₹${safeStats.pendingRevenue.toLocaleString("en-IN")}`}
            icon={<LuIndianRupee />}
          />

          <StatCard
            title="Today's Revenue"
            value={`₹${safeStats.todaysRevenue.toLocaleString("en-IN")}`}
            icon={<LuIndianRupee />}
          />
          <StatCard
            title="Total Partners"
            value={safeStats.totalPartners.toString()}
            icon={<LuTruck />}
          />
          <StatCard
            title="Active Partners"
            value={safeStats.activePartners.toString()}
            icon={<LuTruck />}
          />

      </div>

      {/* INFO GRID */}
      <div className={styles.row}>
        <div className={styles.card}>
          <h3>Basic Information</h3>
          <div className={styles.infoRow}><h5><LuPhone /> Phone</h5> <p>{mess.phone}</p></div>
          <div className={styles.infoRow}><h5><LuMail /> Email</h5> <p>{mess.email}</p></div>
          <div className={styles.infoRow}><h5><LuMapPin /> Address</h5> <p>{mess.address}</p></div>
          <div className={styles.infoRow}><h5><LuMapPin /> Location</h5> <p>{mess.location}</p></div>
          <div className={styles.infoRow}><h5><LuCalendar /> Created</h5> <p>{new Date(mess.createdAt).toDateString()}</p></div>
        </div>

        <div className={styles.card}>
          <h3>Description</h3>
          <p>{mess.description || "No description provided."}</p>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.card}>
          <h3>Opening Hours</h3>
          {mess.openingHours && Object.keys(mess.openingHours).length > 0 ? (
            Object.entries(mess.openingHours).map(([day, time]) => (
              <p key={day}>
                <strong>{day}:</strong> {time}
              </p>
            ))
          ) : (
            <p>No opening hours provided.</p>
          )}


        </div>
        <div className={styles.card}>
          <h3>Meal Plans</h3>
          <p>No plans configured yet.</p>
        </div>
      </div>

      {/* MESS ADMINS */}
      <div className={styles.card}>
        <h3>Mess Admins (1)</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Admin</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Added On</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fayas</td>
              <td>fayas@gmail.com</td>
              <td>9995602471</td>
              <td><span className={styles.active}>Active</span></td>
              <td>Jan 27, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* EMPTY SECTIONS */}
      <div className={styles.row}>
        <div className={styles.card}>
          <h3>Active Subscriptions</h3>
          <p>No active subscriptions.</p>
        </div>

        <div className={styles.card}>
          <h3>Delivery Partners</h3>
          <p>No delivery partners assigned.</p>
        </div>
      </div>

      {/* GALLERY */}
      <div className={styles.card}>
        <h3>Gallery (1)</h3>
        {mess.images.length === 0 ? (
          <p>No images uploaded.</p>
        ) : (
          mess.images.map(img => (
            <img
              key={img.id}
              src={img.url}
              className={styles.image}
            />
          ))
        )}

      </div>

    </div>
  );
};

export default MessDetails;
