import { useLocation } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
  const location = useLocation();

  // Map routes to titles
  const getTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/messes":
        return "Messes";
      case "/delivery-agents":
        return "Delivery Agents";
      default:
        return "Dashboard";
    }
  };

  return (
    <header className={styles.header}>
      <h2 className={styles.title}>{getTitle()}</h2>
    </header>
  );
};

export default Header;
