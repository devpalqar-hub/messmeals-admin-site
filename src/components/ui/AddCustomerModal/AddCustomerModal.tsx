import { useState } from "react";
import { LuX } from "react-icons/lu";
import styles from "./AddCustomerModal.module.css";
import { registerCustomer } from "../../../services/customers.api";
import { DAYS_OF_WEEK, type ScheduleType } from "../../../types/customer.types";
import { useToast } from "../Toast/ToastContainer";

interface PlanOption {
  id: string;
  planName: string;
  price: number | string;
}

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plans: PlanOption[];
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as any;
    const message = err.response?.data?.message;
    if (message) {
      if (Array.isArray(message)) {
        return message.map((m) => (typeof m === "string" ? m : JSON.stringify(m))).join(", ");
      }
      if (typeof message === "string") return message;
    }
    if (err.message && typeof err.message === "string") return err.message;
  }
  return "Failed to register customer";
};

const todayIso = () => new Date().toISOString().split("T")[0];

export default function AddCustomerModal({
  isOpen,
  onClose,
  onSuccess,
  plans,
}: AddCustomerModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    planId: "",
    walletAmount: "0",
    discount: "",
    start_date: todayIso(),
    end_date: "",
    scheduleType: "EVERYDAY" as ScheduleType,
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleReset = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      planId: "",
      walletAmount: "0",
      discount: "",
      start_date: todayIso(),
      end_date: "",
      scheduleType: "EVERYDAY",
    });
    setSelectedDays([]);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address || !form.planId || !form.start_date) {
      showToast("Please fill in name, phone, address, plan and start date", "error");
      return;
    }
    if (form.scheduleType === "CUSTOM" && selectedDays.length === 0) {
      showToast("Select at least one day for a custom schedule", "error");
      return;
    }

    try {
      setLoading(true);

      await registerCustomer({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address,
        walletAmount: form.walletAmount || "0",
        planId: form.planId,
        start_date: form.start_date,
        end_date: form.end_date || undefined,
        scheduleType: form.scheduleType,
        selectedDays: form.scheduleType === "CUSTOM" ? selectedDays : undefined,
        discount: form.discount || undefined,
      });

      showToast("Customer registered and subscribed to plan successfully", "success");
      handleReset();
      onSuccess();
    } catch (error) {
      console.error("Register customer failed", error);
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleReset}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Add Customer &amp; Assign Plan</h2>
          <button type="button" className={styles.closeBtn} onClick={handleReset}>
            <LuX size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Customer full name" />
            </div>
            <div className={styles.formGroup}>
              <label>Phone *</label>
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, "").slice(0, 10);
                }}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="customer@example.com" />
            </div>
            <div className={styles.formGroup}>
              <label>Wallet Amount</label>
              <input name="walletAmount" type="number" value={form.walletAmount} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Address *</label>
            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Delivery address" rows={2} />
          </div>

          <div className={styles.formGroup}>
            <label>Plan *</label>
            <select name="planId" value={form.planId} onChange={handleChange}>
              <option value="">Select a plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.planName} — ₹{Number(plan.price).toLocaleString("en-IN")}
                </option>
              ))}
            </select>
            {plans.length === 0 && (
              <p className={styles.emptyText}>No plans configured for this mess yet — add one first.</p>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Start Date *</label>
              <input name="start_date" type="date" value={form.start_date} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input name="end_date" type="date" value={form.end_date} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Schedule Type</label>
              <select name="scheduleType" value={form.scheduleType} onChange={handleChange}>
                <option value="EVERYDAY">Everyday</option>
                <option value="CUSTOM">Custom</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Discount</label>
              <input name="discount" type="number" value={form.discount} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          {form.scheduleType === "CUSTOM" && (
            <div className={styles.formGroup}>
              <label>Selected Days *</label>
              <div className={styles.dayGrid}>
                {DAYS_OF_WEEK.map((day) => (
                  <label key={day} className={styles.dayItem}>
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      onChange={() => toggleDay(day)}
                    />
                    <span>{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={handleReset}>
            Cancel
          </button>
          <button type="button" className={styles.createBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? "Adding..." : "Add Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
