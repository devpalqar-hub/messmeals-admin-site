import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiHome,
  FiTruck,
  FiLogOut,
  FiMessageSquare,
} from "react-icons/fi";
import styles from "./Sidebar.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import ConfirmModal from "../../ui/ConfirmModal/ConfirmModal";


const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={styles.sidebar}>
      
      {/* LOGO */}
      <div>
        <div className={styles.logoBox}>
            <div className={styles.logo}>🍽</div>
            <div>
            <h3>Mess Meals</h3>
            <span>Admin Panel</span>
            </div>
        </div>

        {/* MENU */}
        <nav className={styles.menu}>
            <NavLink 
                to="/dashboard" 
                className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                }
            >
            <FiGrid />
            <span>Dashboard</span>
            </NavLink>

            <NavLink 
                to="/messes" 
                className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
            }
            >
            <FiHome />
            <span>Messes</span>
            </NavLink>

            <NavLink 
                to="/delivery-agents" 
                className={({ isActive }) =>
                 isActive ? `${styles.link} ${styles.active}` : styles.link
            }
            >  
            <FiTruck />
            <span>Delivery Agents</span>
            </NavLink>

            <div
              className={styles.group}
            >
              <div className={styles.groupHeader}>
                <FiMessageSquare />
                <span>Enquiries</span>
              </div>
            </div>

              <div className={styles.subMenu}>
                <NavLink
                  to="/mess-enquiries"
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.subLink} ${styles.active}`
                      : styles.subLink
                  }
                >
                  Mess Enquiries
                </NavLink>

                <NavLink
                  to="/customer-enquiries"
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.subLink} ${styles.active}`
                      : styles.subLink
                  }
                >
                  Customer Enquiries
                </NavLink>
              </div>

        </nav>
      </div>

      {/* LOGOUT */}
      <div className={styles.logout} onClick={() => setOpen(true)}>
        <FiLogOut />
        <span>Logout</span>
      </div>
      <ConfirmModal
        open={open}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={handleLogout}
        onCancel={() => setOpen(false)}
      />
    </aside>
  );
};

export default Sidebar;
