import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import styles from "./DeliveryDetails.module.css";
import { getDeliveryById } from "../../services/deliveries.api";
import type { DeliveryDetailResponse } from "../../types/delivery.types";
import { useToast } from "../../components/ui/Toast/ToastContainer";

export default function DeliveryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [delivery, setDelivery] = useState<DeliveryDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    };

  useEffect(() => {
    if (!id) return;

    const fetchDelivery = async () => {
      try {
        setLoading(true);
        const res = await getDeliveryById(id);
        setDelivery(res.data);
      } catch (error) {
        console.error("Failed to load delivery", error);
        showToast("Failed to load delivery", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [id]);

  if (loading) {
    return <div className={styles.wrapper}>Loading delivery details...</div>;
  }

  if (!delivery) {
    return <div className={styles.wrapper}>Delivery not found.</div>;
  }

  const getStatusColor = () => {
    switch (delivery.status) {
      case "PENDING":
        return "#92400e";
      case "PROGRESS":
        return "#1e40af";
      case "DELIVERED":
        return "#166534";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.back} onClick={() => navigate("/deliveries")}>
        <LuArrowLeft /> Back to Deliveries
      </div>

      {/* STATUS HEADER */}
      <div className={styles.statusHeader}>
        <div className={styles.statusBadge} style={{ borderColor: getStatusColor(), color: getStatusColor() }}>
          {delivery.status}
        </div>
        {/* <div className={styles.deliveryId}>ID: {delivery.id}</div> */}
      </div>

      {/* CUSTOMER INFO */}
      <div className={styles.card}>
        <h3>Customer Information</h3>

        <div className={styles.grid}>
          <div>
            <label>Name</label>
            <div className={styles.readOnlyValue}>{delivery.customer.user?.name || "-"}</div>
          </div>
          <div>
            <label>Email</label>
            <div className={styles.readOnlyValue}>{delivery.customer.user?.email || "-"}</div>
          </div>
          <div>
            <label>Phone</label>
            <div className={styles.readOnlyValue}>{delivery.customer.user?.phone || "-"}</div>
          </div>
          <div>
            <label>Wallet Amount</label>
            <div className={styles.readOnlyValue}>₹{delivery.customer.walletAmount}</div>
          </div>
          <div className={styles.fullWidth}>
            <label>Address</label>
            <div className={styles.readOnlyValue}>{delivery.customer.address || "-"}</div>
          </div>
          <div className={styles.fullWidth}>
            <label>Current Location</label>
            <div className={styles.readOnlyValue}>{delivery.customer.current_location || "-"}</div>
          </div>
          <div>
            <label>Coordinates</label>
            <div className={styles.readOnlyValue}>{delivery.customer.latitude_logitude || "-"}</div>
          </div>
        </div>
      </div>

      {/* DELIVERY DETAILS */}
      <div className={styles.card}>
        <h3>Delivery Information</h3>

        <div className={styles.grid}>
          <div>
            <label>Delivery Date</label>
            <div className={styles.readOnlyValue}>
              {new Date(delivery.date).toLocaleDateString()}
            </div>
          </div>
          {/* <div>
            <label>Status</label>
            <div className={styles.readOnlyValue}>{delivery.status}</div>
          </div> */}
          <div>
            <label>Created At</label>
            <div className={styles.readOnlyValue}>
              {formatDateTime(delivery.createdAt)}
            </div>
          </div>
          <div>
            <label>Updated At</label>
            <div className={styles.readOnlyValue}>
              {formatDateTime(delivery.updatedAt)}
            </div>
          </div>
          <div>
            <label>Is Active</label>
            <div className={styles.readOnlyValue}>
              {delivery.isActive ? "Yes" : "No"}
            </div>
          </div>
          {/* <div>
            <label>Subscription ID</label>
            <div className={styles.readOnlyValue}>{delivery.subscriptionId}</div>
          </div> */}
        </div>
      </div>

      {/* MESS INFO */}
      <div className={styles.card}>
        <h3>Mess Information</h3>

        <div className={styles.grid}>
          <div>
            <label>Mess Name</label>
            <div className={styles.readOnlyValue}>{delivery.mess.name || "-"}</div>
          </div>
          <div>
            <label>Phone</label>
            <div className={styles.readOnlyValue}>{delivery.mess.phone || "-"}</div>
          </div>
          <div>
            <label>Email</label>
            <div className={styles.readOnlyValue}>{delivery.mess.email || "-"}</div>
          </div>
          <div>
            <label>Premium</label>
            <div className={styles.readOnlyValue}>
              {delivery.mess.isPremium ? "Yes" : "No"}
            </div>
          </div>
          <div>
            <label>Active</label>
            <div className={styles.readOnlyValue}>
              {delivery.mess.is_active ? "Yes" : "No"}
            </div>
          </div>
          <div>
            <label>Verified</label>
            <div className={styles.readOnlyValue}>
              {delivery.mess.is_verified ? "Yes" : "No"}
            </div>
          </div>
          <div className={styles.fullWidth}>
            <label>Address</label>
            <div className={styles.readOnlyValue}>{delivery.mess.address || "-"}</div>
          </div>
        </div>
      </div>

      {/* PLAN INFO */}
      <div className={styles.card}>
        <h3>Plan Information</h3>

        <div className={styles.grid}>
          <div>
            <label>Plan Name</label>
            <div className={styles.readOnlyValue}>{delivery.plan.planName || "-"}</div>
          </div>
          <div>
            <label>Price</label>
            <div className={styles.readOnlyValue}>₹{delivery.plan.price || "0"}</div>
          </div>
          <div>
            <label>Plan Type</label>
            <div className={styles.readOnlyValue}>
              {delivery.plan.isDailyPlan ? "Daily" : delivery.plan.isMonthlyPlan ? "Monthly" : "-"}
            </div>
          </div>
          <div>
            <label>Active</label>
            <div className={styles.readOnlyValue}>
              {delivery.plan.isActive ? "Yes" : "No"}
            </div>
          </div>
          <div className={styles.fullWidth}>
            <label>Description</label>
            <div className={styles.readOnlyValue}>{delivery.plan.description || "-"}</div>
          </div>
        </div>
      </div>

      {/* DELIVERY AGENT INFO */}
      <div className={styles.card}>
        <h3>Delivery Agent Information</h3>

        <div className={styles.grid}>
          <div>
            <label>Agent Name</label>
            <div className={styles.readOnlyValue}>{delivery.partner.user?.name || "-"}</div>
          </div>
          <div>
            <label>Email</label>
            <div className={styles.readOnlyValue}>{delivery.partner.user?.email || "-"}</div>
          </div>
          <div>
            <label>Phone</label>
            <div className={styles.readOnlyValue}>{delivery.partner.user?.phone || "-"}</div>
          </div>
          <div>
            <label>Online Status</label>
            <div className={styles.readOnlyValue}>
              {delivery.partner.isonline ? "Online" : "Offline"}
            </div>
          </div>
          <div>
            <label>Delivery Region</label>
            <div className={styles.readOnlyValue}>{delivery.partner.deliveryRegion || "-"}</div>
          </div>
          <div>
            <label>Delivery Counts</label>
            <div className={styles.readOnlyValue}>{delivery.partner.deliveryCounts || "0"}</div>
          </div>
          <div className={styles.fullWidth}>
            <label>Address</label>
            <div className={styles.readOnlyValue}>{delivery.partner.address || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
