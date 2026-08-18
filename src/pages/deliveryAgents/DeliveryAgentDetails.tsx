import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import styles from "./DeliveryAgentDetails.module.css";
import { getDeliveryAgentById, type DeliveryAgent } from "../../services/deliveryAgents.api";
import { useToast } from "../../components/ui/Toast/ToastContainer";

export default function DeliveryAgentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [agent, setAgent] = useState<DeliveryAgent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAgent = async () => {
      try {
        setLoading(true);
        const res = await getDeliveryAgentById(id);
        setAgent(res.data.data);
      } catch (error) {
        console.error("Failed to load delivery agent", error);
        showToast("Failed to load delivery agent", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  if (loading) {
    return <div className={styles.wrapper}>Loading delivery agent...</div>;
  }

  if (!agent) {
    return <div className={styles.wrapper}>Delivery agent not found.</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.back} onClick={() => navigate("/delivery-agents") }>
        <LuArrowLeft /> Back to Delivery Agents
      </div>

      <div className={styles.card}>
        <h3>Delivery Agent Details</h3>

        <div className={styles.grid}>
          <div>
            <label>Name</label>
            <div className={styles.readOnlyValue}>{agent.name}</div>
          </div>
          <div>
            <label>Email</label>
            <div className={styles.readOnlyValue}>{agent.email}</div>
          </div>
          <div>
            <label>Phone</label>
            <div className={styles.readOnlyValue}>{agent.phone}</div>
          </div>
          <div>
            <label>Status</label>
            <div className={styles.readOnlyValue}>
              {agent.is_active ? "Active" : "Inactive"}
            </div>
          </div>
          <div>
            <label>Address</label>
            <div className={styles.readOnlyValue}>
              {agent.deliveryPartnerProfile?.address || "-"}
            </div>
          </div>
          <div>
            <label>Mess ID</label>
            <div className={styles.readOnlyValue}>
              {agent.deliveryPartnerProfile?.messId || "-"}
            </div>
          </div>
          <div>
            <label>Region</label>
            <div className={styles.readOnlyValue}>
              {agent.deliveryPartnerProfile?.deliveryRegion || "-"}
            </div>
          </div>
          <div>
            <label>Delivery Online</label>
            <div className={styles.readOnlyValue}>
              {agent.deliveryPartnerProfile?.isonline ? "Yes" : "No"}
            </div>
          </div>
        </div>

        <div className={styles.fullWidth}>
          <h4>Stats</h4>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span>Total Deliveries</span>
              <strong>{agent.stats?.totalDeliveries ?? 0}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Completed</span>
              <strong>{agent.stats?.completedDeliveries ?? 0}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Pending</span>
              <strong>{agent.stats?.pendingDeliveries ?? 0}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Total Earnings</span>
              <strong>{agent.stats?.totalEarnings ?? 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
