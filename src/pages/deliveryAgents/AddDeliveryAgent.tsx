import React, { useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuPlus } from "react-icons/lu";
import styles from "./AddDeliveryAgent.module.css";
import { createDeliveryAgent } from "../../services/deliveryAgents.api";
import { getMesses, type Mess } from "../../services/mess.api";
import { useToast } from "../../components/ui/Toast/ToastContainer";

export default function AddDeliveryAgent() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    messId: "",
  });

  // Mess selection modal state
  const [showMessModal, setShowMessModal] = useState(false);
  const [messes, setMesses] = useState<Mess[]>([]);
  const [selectedMess, setSelectedMess] = useState<Mess | null>(null);
  const [messPage, setMessPage] = useState(1);
  const [messLimit] = useState(5);
  const [messTotalPages, setMessTotalPages] = useState(1);
  const [messesLoading, setMessesLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch messes when modal opens or page changes
  React.useEffect(() => {
    if (showMessModal) {
      const fetchMesses = async () => {
        try {
          setMessesLoading(true);
          const res = await getMesses(messPage, messLimit);
          setMesses(res.data.data || []);
          setMessTotalPages(res.data.meta?.totalPages || 1);
        } catch (error) {
          console.error("Failed to fetch messes", error);
          showToast("Failed to load messes", "error");
        } finally {
          setMessesLoading(false);
        }
      };

      fetchMesses();
    }
  }, [showMessModal, messPage, messLimit, showToast]);

  const handleMessModalClose = () => {
    setShowMessModal(false);
    setMessPage(1);
  };

  const handleSelectMess = (mess: Mess) => {
    setSelectedMess(mess);
    setForm((prev) => ({ ...prev, messId: mess.id }));
    setShowMessModal(false);
    setMessPage(1);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.email || !form.address || !selectedMess) {
      showToast("Please fill all fields and select a mess", "error");
      return;
    }

    try {
      setLoading(true);
      await createDeliveryAgent(form);
      showToast("Delivery agent created successfully", "success");
      navigate("/delivery-agents");
    } catch (error) {
      console.error("Create delivery agent failed", error);
      showToast("Failed to create delivery agent", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.back} onClick={() => navigate("/delivery-agents") }>
        <LuArrowLeft /> Back to Delivery Agents
      </div>

      <div className={styles.card}>
        <h3>Add Delivery Agent</h3>

        <div className={styles.grid}>
          <div>
            <label>Name *</label>
            <input
              name="name"
              value={form.name}
              placeholder="Enter full name"
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Phone *</label>
            <input
              name="phone"
              value={form.phone}
              placeholder="+919876543210"
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              placeholder="agent@example.com"
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Mess *</label>
            {selectedMess ? (
              <div className={styles.selectedMess}>
                <div>
                  <p>{selectedMess.name}</p>
                </div>
                <button
                  type="button"
                  className={styles.changeBtn}
                  onClick={() => setShowMessModal(true)}
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.selectBtn}
                onClick={() => setShowMessModal(true)}
              >
                <LuPlus /> Select Mess
              </button>
            )}
          </div>
        </div>

        <div className={styles.fullWidth}>
          <label>Address *</label>
          <textarea
            name="address"
            value={form.address}
            placeholder="Delivery address"
            onChange={handleChange}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={() => navigate("/delivery-agents") }>
            Cancel
          </button>
          <button className={styles.create} onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Delivery Agent"}
          </button>
        </div>
      </div>

      {showMessModal && (
        <div className={styles.modalOverlay} onClick={handleMessModalClose}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Select Mess</h3>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={handleMessModalClose}
              >
                ×
              </button>
            </div>

            {messesLoading ? (
              <div>Loading messes...</div>
            ) : messes.length === 0 ? (
              <div>No messes found.</div>
            ) : (
              <div className={styles.messList}>
                {messes.map((mess) => (
                  <button
                    key={mess.id}
                    type="button"
                    className={`${styles.messListItem} ${selectedMess?.id === mess.id ? styles.selectedMessRow : ""}`}
                    onClick={() => handleSelectMess(mess)}
                  >
                    <div>
                      <strong>{mess.name}</strong>
                      <p>{mess.email}</p>
                      <small>{mess.location || "No location"}</small>
                    </div>
                    <span>
                      {selectedMess?.id === mess.id ? "Selected" : "Select"}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className={styles.pagination}>
              <button
                type="button"
                disabled={messPage === 1}
                onClick={() => setMessPage((p) => p - 1)}
              >
                Prev
              </button>
              <span>
                Page {messPage} of {messTotalPages}
              </span>
              <button
                type="button"
                disabled={messPage === messTotalPages}
                onClick={() => setMessPage((p) => p + 1)}
              >
                Next
              </button>
            </div>

            {/* <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancel}
                onClick={handleMessModalClose}
              >
                Done
              </button>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}
