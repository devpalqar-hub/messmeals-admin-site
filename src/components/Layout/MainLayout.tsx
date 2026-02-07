import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.css";
import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";

const MainLayout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />

      <div className={styles.main}>
        <Header />

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
