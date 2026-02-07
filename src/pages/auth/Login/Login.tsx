import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./Login.module.css";
import { loginSuperAdmin } from "../../../api/auth.api";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/ui/Toast/ToastContainer";
import axios from "axios";


export default function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Email and password required", "info");
      return;
    }

    try {
      setLoading(true);

      const res = await loginSuperAdmin(email, password);

      const { accessToken } = res.data;

      login(accessToken);
      showToast("Login successful", "success");

      navigate("/dashboard");

    } catch (err: unknown) {
        let msg = "Invalid email or password";
        if (axios.isAxiosError(err)) {
          msg = err.response?.data?.message || msg;
        }
        showToast(msg, "error");
      } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.container}>
      {/* LEFT SIDE */}
      <div className={styles.left}>
        <div className={styles.brand}>
          <div className={styles.logo}>🍽</div>
          <h3>Mess Meals</h3>
        </div>

        <h1>Admin Dashboard</h1>
        <p>
          Manage your food marketplace platform efficiently.
          <br />
          Monitor messes, users, subscriptions, and deliveries all in one place.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className={styles.right}>
        <h2>Welcome back</h2>
        <p className={styles.subtitle}>
          Enter your credentials to access your account
        </p>

        <div className={styles.form}>
          <label>Email address</label>
          <div className={styles.inputfield}>
            <FiMail />
            <input
              type="email"
              placeholder="admin@messmeal.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <label>Password</label>
          <div className={styles.inputfield}>
            <FiLock />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
            {showPassword ? (
                <FiEyeOff
                  className={styles.eye}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <FiEye
                  className={styles.eye}
                  onClick={() => setShowPassword(true)}
                />
              )}

          </div>

          <button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </div>
      </div>
    </div>
  );
};


