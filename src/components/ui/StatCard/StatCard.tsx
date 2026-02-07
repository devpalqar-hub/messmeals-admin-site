import styles from "./StatCard.module.css";
import type  { ReactNode } from "react";

type Props = {
  title: string;
  value: string;
  icon: ReactNode;
};

const StatCard = ({ title, value, icon }: Props) => {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <p>{title}</p>
        <div className={styles.iconBox}>{icon}</div>
      </div>

      <h2>{value}</h2>
    </div>
  );
};

export default StatCard;
