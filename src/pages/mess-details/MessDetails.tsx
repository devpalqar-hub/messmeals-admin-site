import styles from "./MessDetails.module.css";
import { LuArrowLeft, LuCalendar, LuMail, LuMapPin, LuPencil, LuPhone, LuTrash, LuTruck } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/ui/StatCard/StatCard";

const MessDetails = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.left}>
          <LuArrowLeft onClick={() => navigate(-1)} />
          <h2>Riseres Mess</h2>
          <span className={styles.active}>Active</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.edit}>
            <LuPencil /> Edit
          </button>
          <button className={styles.delete}>
            <LuTrash /> Delete
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Total Revenue"
          value="₹4.5L"
          icon={<LuTruck />}
        />
        <StatCard
          title="Completed Orders"
          value="1456"
          icon={<LuTruck />}
        />
        <StatCard
          title="Total Orders"
          value="1456"
          icon={<LuTruck />}
        />
        <StatCard
          title="Total Orders"
          value="1456"
          icon={<LuTruck />}
        />
        <StatCard
          title="Total Orders"
          value="1456"
          icon={<LuTruck />}
        />
        <StatCard
          title="Total Orders"
          value="1456"
          icon={<LuTruck />}
        />
        <StatCard
          title="Total Orders"
          value="1456"
          icon={<LuTruck />}
        />
        <StatCard
          title="Total Orders"
          value="1456"
          icon={<LuTruck />}
        />
      </div>

      {/* INFO GRID */}
      <div className={styles.row}>
        <div className={styles.card}>
          <h3>Basic Information</h3>
          <div className={styles.infoRow}><h5><LuPhone /> Phone</h5> <p>92836596878</p></div>
          <div className={styles.infoRow}><h5><LuMail /> Email</h5> <p>ruserws@gmail.com</p></div>
          <div className={styles.infoRow}><h5><LuMapPin /> Address</h5> <p>Riseres Mess Address</p></div>
          <div className={styles.infoRow}><h5><LuMapPin /> Location</h5> <p>Alappuzha</p></div>
          <div className={styles.infoRow}><h5><LuCalendar /> Created</h5> <p>Jan 27, 2026</p></div>
        </div>

        <div className={styles.card}>
          <h3>Description</h3>
          <p>riseres mess description</p>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.card}>
          <h3>Opening Hours</h3>
          <p>Monday: 9:30 - 16:00</p>
          <p>Tuesday: 9:30 - 16:00</p>
          <p>Wednesday: 9:30 - 16:00</p>
          <p>Thursday: 9:30 - 16:00</p>
          <p>Friday: 9:30 - 16:00</p>
          <p>Saturday: 9:30 - 16:00</p>
          <p>Sunday: Closed</p>
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
        <img
          src="https://images.unsplash.com/photo-1604908177522-040a4b2e5c5c"
          className={styles.image}
        />
      </div>

    </div>
  );
};

export default MessDetails;
