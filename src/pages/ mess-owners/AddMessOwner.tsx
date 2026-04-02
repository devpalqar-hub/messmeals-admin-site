import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AddMessOwner.module.css";
import { sendMessOwnerOtp } from "../../api/messOwners.api";
import { useToast } from "../../components/ui/Toast/ToastContainer";
import { verifyMessOwnerOtp } from "../../api/messOwners.api";



const AddMessOwner = () => {
   const navigate = useNavigate();
   const { showToast } = useToast();
   const [sessionId, setSessionId] = useState<string | null>(null);
   const [showOtpModal, setShowOtpModal] = useState(false);
   const [otp, setOtp] = useState("");


  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    messId: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  

  const handleSubmit = async () => {
  try {
    setLoading(true);

    const res = await sendMessOwnerOtp(form);

    setSessionId(res.data.sessionId); // store session id
    showToast("OTP sent successfully", "success");

    setShowOtpModal(true); // open modal
  } catch (error: any) {
    showToast(
      error.response?.data?.message || "Something went wrong",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

const handleVerifyOtp = async () => {
  try {
    if (!sessionId) return;

    await verifyMessOwnerOtp({
      phone: form.phone,
      sessionId,
      otp,
    });

    showToast("Mess Owner created successfully!", "success");

    setShowOtpModal(false);
    navigate("/mess-owners");

  } catch (error: any) {
    showToast(
      error.response?.data?.message || "Invalid OTP",
      "error"
    );
  }
};


  return (
  <div className={styles.wrapper}>
    
    <div className={styles.topBar}>
      <button
        className={styles.backBtn}
        onClick={() => navigate("/mess-owners")}
      >
        ← Back to Mess Owners
      </button>
    </div>

    <div className={styles.card}>
      <input
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
      />

      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>
    </div>
    {showOtpModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h3>Enter OTP</h3>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <div className={styles.modalActions}>
        <button onClick={handleVerifyOtp} disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button onClick={() => setShowOtpModal(false)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
 )}
  </div>
);
};
export default AddMessOwner;
