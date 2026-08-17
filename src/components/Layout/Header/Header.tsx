import { useLocation } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
  const location = useLocation();

  // Map routes to titles
  const getTitle = () => {
    const path = location.pathname;

    if (path.startsWith("/messes")) return "Messes";
    if (path.startsWith("/mess-owners")) return "Mess Owners";
    if (path.startsWith("/delivery-agents")) return "Delivery Agents";
    if (path.startsWith("/deliveries")) return "Deliveries";
    if (path.startsWith("/mess-enquiries")) return "Mess Enquiries";
    if (path.startsWith("/customer-enquiries")) return "Customer Enquiries";
    if (path.startsWith("/settings")) return "Settings";

    return "Dashboard";
  };

  return (
    <header className={styles.header}>
      <h2 className={styles.title}>{getTitle()}</h2>
    </header>
  );
};

export default Header;
