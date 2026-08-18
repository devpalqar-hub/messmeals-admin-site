import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Deliveries.module.css";
import { LuEye, LuSearch } from "react-icons/lu";
import { getDeliveries} from "../../services/deliveries.api";
import type { Delivery, DeliveryStatus } from "../../types/delivery.types";
import { useToast } from "../../components/ui/Toast/ToastContainer";

export default function Deliveries() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const limit = 7;
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"ALL" | DeliveryStatus>("ALL");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDeliveries();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [page, status, date, search]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await getDeliveries(
        page,
        limit,
        status === "ALL" ? undefined : status,
        date || undefined,
        search
      );
      setDeliveries(res.data.data || []);
      setTotalPages(res.data.totalPages ?? 1);
    } catch (error) {
      console.error("Failed to load deliveries", error);
      showToast("Failed to load deliveries", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setPage(1);
    switch (filterType) {
      case "status":
        setStatus(value as "ALL" | DeliveryStatus);
        break;
      case "date":
        setDate(value);
        break;
    }
  };

  const getStatusBadgeClass = (deliveryStatus: DeliveryStatus) => {
    switch (deliveryStatus) {
      case "PENDING":
        return styles.statusPending;
      case "PROGRESS":
        return styles.statusProgress;
      case "DELIVERED":
        return styles.statusDelivered;
      default:
        return "";
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* FILTERS */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <LuSearch />

          <input
            type="text"
            placeholder="Search deliveries..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className={styles.filterGroup}>
          <select
            value={status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className={styles.filterSelect}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROGRESS">In Progress</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <input
            type="date"
            value={date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            className={styles.filterInput}
            placeholder="Select date"
          />
        </div>

        {/* <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder="Filter by Mess ID"
            value={messId}
            onChange={(e) => handleFilterChange("messId", e.target.value)}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder="Filter by Partner ID"
            value={partnerId}
            onChange={(e) => handleFilterChange("partnerId", e.target.value)}
            className={styles.filterInput}
          />
        </div> */}
      </div>

      {/* TABLE */}
      <div className={styles.tableBox}>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Mess</th>
              <th>Plan</th>
              <th>Delivery Agent</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && deliveries.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  No deliveries found
                </td>
              </tr>
            )}
            {!loading &&
              deliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>
                    <div className={styles.customerInfo}>
                      <div className={styles.name}>
                        {delivery.customer?.user?.name || "N/A"}
                      </div>
                      <div className={styles.subText}>
                        {delivery.customer?.user?.phone || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.messInfo}>
                      {delivery.mess?.name || "N/A"}
                    </div>
                  </td>
                  <td>
                    <div className={styles.planInfo}>
                      <div className={styles.name}>
                        {delivery.plan?.planName || "N/A"}
                      </div>
                      <div className={styles.subText}>
                        ₹{delivery.plan?.price || "0"}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.agentInfo}>
                      <div className={styles.name}>
                        {delivery.partner?.user?.name || "N/A"}
                      </div>
                      <div className={styles.subText}>
                        {delivery.partner?.user?.phone || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className={styles.date}>
                    {new Date(delivery.date).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(delivery.status)}>
                      {delivery.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <LuEye
                        className={styles.actionsIcon}
                        onClick={() => navigate(`/deliveries/${delivery.id}`)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className={styles.pagination}>
        <div>
          Page {page} of {totalPages}
        </div>
        <div className={styles.paginationbuttons}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
