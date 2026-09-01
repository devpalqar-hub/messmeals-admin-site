import { useEffect, useState } from "react";
import { LuPlus, LuX } from "react-icons/lu";
// Reuses CreatePlanModal's styling — same overlay/modal/form language across the app.
import styles from "../CreatePlanModal/CreatePlanModal.module.css";
import api from "../../../services/axios";
import {
  createMenu,
  updateMenu,
  MENU_WEEKDAYS,
  type MenuDayEntry,
  type MenuResponse,
  type MenuWeekday,
} from "../../../services/menu.api";
import { useToast } from "../Toast/ToastContainer";

interface Variation {
  id: string;
  title: string;
  isActive: boolean;
}

interface CreateMenuModalProps {
  messId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isEdit?: boolean;
  menu?: MenuResponse | null;
}

const dayLabel = (day: MenuWeekday) => day.charAt(0).toUpperCase() + day.slice(1);

const emptySchedule = (): Record<MenuWeekday, MenuDayEntry[]> =>
  MENU_WEEKDAYS.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {} as Record<MenuWeekday, MenuDayEntry[]>);

export default function CreateMenuModal({
  messId,
  isOpen,
  onClose,
  onSuccess,
  isEdit = false,
  menu = null,
}: CreateMenuModalProps) {
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [variationList, setVariationList] = useState<Variation[]>([]);
  const [schedule, setSchedule] = useState<Record<MenuWeekday, MenuDayEntry[]>>(emptySchedule());
  const [activeDay, setActiveDay] = useState<MenuWeekday>("monday");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchVariations = async () => {
      try {
        const res = await api.get("/variation/");
        setVariationList(res.data);
      } catch (error) {
        console.error("Failed to fetch variations", error);
      }
    };

    fetchVariations();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && menu) {
      setName(menu.name || "");
      const next = emptySchedule();
      for (const day of MENU_WEEKDAYS) {
        next[day] = menu[day] ?? [];
      }
      setSchedule(next);
    } else {
      setName("");
      setSchedule(emptySchedule());
    }
    setActiveDay("monday");
  }, [isOpen, isEdit, menu]);

  const addEntry = (day: MenuWeekday) => {
    if (variationList.length === 0) {
      showToast("No variations available. Add a variation first.", "error");
      return;
    }
    setSchedule((prev) => ({
      ...prev,
      [day]: [...prev[day], { variationId: variationList[0].id, items: "" }],
    }));
  };

  const updateEntry = (day: MenuWeekday, index: number, patch: Partial<MenuDayEntry>) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    }));
  };

  const removeEntry = (day: MenuWeekday, index: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const handleReset = () => {
    setName("");
    setSchedule(emptySchedule());
    setActiveDay("monday");
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast("Please enter a menu name", "error");
      return;
    }

    const hasAnyDay = MENU_WEEKDAYS.some((day) => schedule[day].length > 0);
    if (!hasAnyDay) {
      showToast("Add at least one item to any day", "error");
      return;
    }

    for (const day of MENU_WEEKDAYS) {
      if (schedule[day].some((entry) => !entry.items.trim())) {
        showToast(`Please fill items for ${dayLabel(day)}`, "error");
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        isActive: true,
        ...MENU_WEEKDAYS.reduce((acc, day) => {
          acc[day] = schedule[day];
          return acc;
        }, {} as Record<MenuWeekday, MenuDayEntry[]>),
      };

      if (isEdit && menu) {
        await updateMenu(menu.id, payload);
        showToast("Menu updated successfully", "success");
      } else {
        await createMenu(messId, payload);
        showToast("Menu created successfully", "success");
      }

      handleReset();
      onSuccess();
    } catch (error: any) {
      console.error("Menu operation failed", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to save menu";
      showToast(
        Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const activeEntries = schedule[activeDay];

  return (
    <div className={styles.overlay} onClick={handleReset}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isEdit ? "Edit Menu" : "Create New Menu"}</h2>
          <button type="button" className={styles.closeBtn} onClick={handleReset}>
            <LuX size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.formGroup}>
            <label>Menu Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Menu"
            />
          </div>

          {/* DAY TABS */}
          <div className={styles.formGroup}>
            <label>Day</label>
            <div className={styles.checkboxGroup}>
              {MENU_WEEKDAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className={styles.checkboxLabel}
                  style={{
                    cursor: "pointer",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "6px 12px",
                    background: activeDay === day ? "#16a34a18" : "transparent",
                    color: activeDay === day ? "#16a34a" : undefined,
                    fontWeight: activeDay === day ? 600 : 400,
                  }}
                >
                  {dayLabel(day)}
                  {schedule[day].length > 0 ? ` (${schedule[day].length})` : ""}
                </button>
              ))}
            </div>
          </div>

          {/* ENTRIES FOR ACTIVE DAY */}
          <div className={styles.formGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label>{dayLabel(activeDay)} Items</label>
              <button
                type="button"
                onClick={() => addEntry(activeDay)}
                className={styles.checkboxLabel}
                style={{ cursor: "pointer", color: "#16a34a", display: "flex", alignItems: "center", gap: 4 }}
              >
                <LuPlus size={16} /> Add item
              </button>
            </div>

            {activeEntries.length === 0 && (
              <p className={styles.emptyText}>No items added</p>
            )}

            {activeEntries.map((entry, index) => (
              <div key={index} className={styles.row} style={{ marginTop: 10, alignItems: "flex-start" }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <select
                    value={entry.variationId}
                    onChange={(e) => updateEntry(activeDay, index, { variationId: e.target.value })}
                  >
                    {variationList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <input
                    type="text"
                    value={entry.items}
                    onChange={(e) => updateEntry(activeDay, index, { items: e.target.value })}
                    placeholder="Rice, Dal, Sabzi, Roti"
                  />
                </div>

                <button
                  type="button"
                  className={styles.removePreviewBtn}
                  style={{ position: "static", marginTop: 8 }}
                  onClick={() => removeEntry(activeDay, index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={handleReset}>
            Cancel
          </button>
          <button type="button" className={styles.createBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Menu" : "Create Menu"}
          </button>
        </div>
      </div>
    </div>
  );
}
