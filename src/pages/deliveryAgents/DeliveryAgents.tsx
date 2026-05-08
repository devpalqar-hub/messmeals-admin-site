import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DeliveryAgents.module.css";
import { LuEye, LuPlus, LuSearch } from "react-icons/lu";
import { getDeliveryAgents, type DeliveryAgent } from "../../services/deliveryAgents.api";
import { useToast } from "../../components/ui/Toast/ToastContainer";

export default function DeliveryAgents() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 7;
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const res = await getDeliveryAgents(page, limit, search);
        setAgents(res.data.data || []);
        setTotalPages(res.data.totalPages ?? 1);
      } catch (error) {
        console.error("Failed to load delivery agents", error);
        showToast("Failed to load delivery agents", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [page, search, showToast]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <div className={styles.searchBox}>
          <LuSearch />
          <input
            placeholder="Search delivery agents..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button
          className={styles.addButton}
          onClick={() => navigate("/delivery-agents/add")}
        >
          <LuPlus /> Add Delivery Agent
        </button>
      </div>

      <div className={styles.tableBox}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Mess ID</th>
              <th>Active</th>
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
            {!loading && agents.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  {search ? "No delivery agents found matching your search" : "No delivery agents found"}
                </td>
              </tr>
            )}
            {!loading && agents.map((agent) => (
              <tr key={agent.id}>
                <td>{agent.name}</td>
                <td className={styles.phone}>{agent.phone}</td>
                <td>{agent.email}</td>
                <td>{agent.deliveryPartnerProfile?.address || "-"}</td>
                <td>{agent.deliveryPartnerProfile?.messId || "-"}</td>
                <td>
                  <span
                    className={
                      agent.is_active ? styles.active : styles.inactive
                    }
                  >
                    {agent.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <LuEye
                      className={styles.actionsIcon}
                      onClick={() => navigate(`/delivery-agents/${agent.id}`)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div>
          Page {page} of {totalPages}
        </div>
        <div className={styles.paginationbuttons}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
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
