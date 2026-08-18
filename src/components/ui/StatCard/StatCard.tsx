import styles from "./StatCard.module.css";
import type { ReactNode } from "react";

type Props = {
  title: string;
  value: string;
  icon: ReactNode;
  variant?: "revenue" | "orders" | "completed" | "pending" | "today" | "partners" | "active";
};

const StatCard = ({ title, value, icon, variant }: Props) => {
  return (
    <div className={`${styles.card} ${variant ? styles[variant] : ""}`}>
      <div className={styles.top}>
        <p>{title}</p>
        <div className={styles.iconBox}>{icon}</div>
      </div>

      <h2>{value}</h2>
    </div>
  );
};

export default StatCard;
