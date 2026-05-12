import styles from "./MessDetails.module.css";
import { LuArrowLeft, LuCalendar, LuIndianRupee, LuMail, LuMapPin, LuPackage, LuPackageCheck, LuPencil, LuPhone, LuTruck, LuPlus } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMessById, getMessStats, type MessDetailsResponse, type MessStats } from "../../services/mess.api";
import CreatePlanModal from "../../components/ui/CreatePlanModal/CreatePlanModal";

import { deleteUserSubscription } from "../../services/mess.api";
import { LuTrash2} from "react-icons/lu";
import { updateUserSubscription } from "../../services/mess.api";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import { deletePlan } from "../../services/mess.api";
import { useToast } from "../../components/ui/Toast/ToastContainer";
import type { Plan } from "../../types/plan.types";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
  sub?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  accent = "#16a34a",
  sub,
}: StatCardProps) => (
  <div className={styles.statCard}>
    <div
      className={styles.statIcon}
      style={{
        background: `${accent}18`,
        color: accent,
      }}
    >
      {icon}
    </div>

    <div className={styles.statContent}>
      <p className={styles.statTitle}>
        {title}
      </p>

      <p className={styles.statValue}>
        {value}
      </p>

      {sub && (
        <p className={styles.statSub}>
          {sub}
        </p>
      )}
    </div>
  </div>
);



const MessDetails = () => {
const navigate = useNavigate();
const { id } = useParams();
const { showToast } = useToast();
const [mess, setMess] = useState<MessDetailsResponse | null>(null);

const [stats, setStats] = useState<MessStats | null>(null);

const [loading, setLoading] = useState(true);
const [deleteSub, setDeleteSub] = useState<any>(null);
const [editingSub, setEditingSub] = useState<any>(null);
const [editForm, setEditForm] = useState<any>({
  scheduleType: "",
  selectedDays: [],
  start_date: "",
});
const [showPlanModal, setShowPlanModal] = useState(false);
const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
const [showEditPlanModal, setShowEditPlanModal] = useState(false);
const DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];
const scheduleMap: Record<string, string> = {
  DAILY: "EVERYDAY",  // if backend supports this
  CUSTOM: "CUSTOM",
};

const safeStats = stats ?? {
  totalRevenue: 0,
  completedOrders: 0,
  totalOrders: 0,
  pendingRevenue: 0,
  todaysRevenue: 0,
  totalPartners: 0,
  activePartners: 0,
};

const [deletePlanId, setDeletePlanId] = useState<string | null>(null);


useEffect(() => {
  if (!id) return;

  const fetchAll = async () => {
    try {
      setLoading(true);

      const messRes = await getMessById(id);
      setMess(messRes.data);

      const today = new Date().toISOString().split("T")[0];

      const statsRes = await getMessStats(id, today);
      setStats(statsRes.data);
      console.log("Fetched stats:", statsRes.data);

    } catch (err) {
      console.error("Failed to load mess details or stats", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAll();
}, [id]);

const handlePlanCreated = async () => {
  // Refetch mess details to get the new plan
  if (!id) return;
  try {
    const messRes = await getMessById(id);
    setMess(messRes.data);
    showToast("Plan added successfully", "success");
  } catch (error) {
    console.error("Failed to refetch mess details", error);
  }
};


if (loading) return <p>Loading mess details...</p>;
if (!mess) return <p>Mess not found</p>;


  return (
    <div className={styles.wrapper}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.left}>
          <LuArrowLeft onClick={() => navigate(-1)} />
          <h2>{mess.name}</h2>
          <span
            className={`${styles.status} ${
              mess.is_active ? styles.active : styles.inactive
            }`}
          >
            {mess.is_active ? "Active" : "Inactive"}
          </span>

        </div>

        <div className={styles.actions}>
        </div>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Total Revenue"
          value={`₹${safeStats.totalRevenue.toLocaleString("en-IN")}`}
          icon={<LuIndianRupee size={20} />}
          accent="#16a34a"
        />

        <StatCard
          title="Total Orders"
          value={safeStats.totalOrders.toLocaleString()}
          icon={<LuPackage size={20} />}
          accent="#2563eb"
        />

        <StatCard
          title="Completed Orders"
          value={safeStats.completedOrders.toLocaleString()}
          icon={<LuPackageCheck size={20} />}
          accent="#059669"
          sub={`${
            safeStats.totalOrders
              ? Math.round(
                  (safeStats.completedOrders /
                    safeStats.totalOrders) *
                    100
                )
              : 0
          }% completion`}
        />

        <StatCard
          title="Pending Revenue"
          value={`₹${safeStats.pendingRevenue.toLocaleString(
            "en-IN"
          )}`}
          icon={<LuIndianRupee size={20} />}
          accent="#d97706"
        />

        <StatCard
          title="Today's Revenue"
          value={`₹${safeStats.todaysRevenue.toLocaleString(
            "en-IN"
          )}`}
          icon={<LuIndianRupee size={20} />}
          accent="#0f766e"
        />

        <StatCard
          title="Delivery Partners"
          value={safeStats.totalPartners.toLocaleString()}
          icon={<LuTruck size={20} />}
          accent="#64748b"
          sub={`${safeStats.activePartners} active`}
        />
      </div>

      {/* INFO GRID */}
      <div className={styles.row}>
        <div className={styles.card}>
          <h3>Basic Information</h3>
          <div className={styles.infoRow}><h5><LuPhone /> Phone</h5> <p>{mess.phone}</p></div>
          <div className={styles.infoRow}><h5><LuMail /> Email</h5> <p>{mess.email}</p></div>
          <div className={styles.infoRow}><h5><LuMapPin /> Address</h5> <p>{mess.address}</p></div>
          <div className={styles.infoRow}><h5><LuMapPin /> Location</h5> <p>{mess.location}</p></div>
          <div className={styles.infoRow}><h5><LuCalendar /> Created</h5> <p>{new Date(mess.createdAt).toDateString()}</p></div>
        </div>

        <div className={styles.card}>
          <h3>Description</h3>
          <p>{mess.description || "No description provided."}</p>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.card}>
          <h3>Opening Hours</h3>
          {mess.openingHours && Object.keys(mess.openingHours).length > 0 ? (
            Object.entries(mess.openingHours).map(([day, time]) => (
              <p key={day}>
                <strong>{day}:</strong> {time}
              </p>
            ))
          ) : (
            <p>No opening hours provided.</p>
          )}


        </div>
        <div className={styles.card}>
  <div className={styles.cardHeader}>
    <h3>Meal Plans ({mess.plans?.length || 0})</h3>
    <button
      type="button"
      className={styles.addPlanBtn}
      onClick={() => setShowPlanModal(true)}
    >
      <LuPlus size={18} /> Add Plan
    </button>
  </div>

  {mess.plans && mess.plans.length > 0 ? (
    <div className={styles.planGrid}>
      {mess.plans.map((plan: any) => (
        <div key={plan.id} className={styles.planCard}>

          {/* Header */}
          <div className={styles.planHeader}>
            <h4>{plan.planName}</h4>

            <div className={styles.planHeaderRight}>
            <div className={styles.priceBox}>
              ₹{Number(plan.price).toLocaleString("en-IN")}
            </div>

            <button
              className={styles.editPlanBtn}
              onClick={() => {
                setEditingPlan(plan);
                setShowEditPlanModal(true);
              }}
            >
              <LuPencil size={16} />
            </button>

            <button
              className={styles.deletePlanBtn}
              onClick={() => setDeletePlanId(plan.id)}
            >
              <LuTrash2 size={16} />
            </button>
          </div>
          </div>

          {/* Min price */}
          {plan.minPrice && (
            <p className={styles.minPrice}>
              Min: ₹{Number(plan.minPrice).toLocaleString("en-IN")}
            </p>
          )}

          {/* Description */}
          {plan.description && (
            <p className={styles.planDescription}>
              {plan.description}
            </p>
          )}

          {/* Plan Type */}
          <div className={styles.planTags}>
            {plan.isMonthlyPlan && (
              <span className={styles.tagGreen}>Monthly</span>
            )}
            {plan.isDailyPlan && (
              <span className={styles.tagBlue}>Daily</span>
            )}
          </div>

          {/* Variations */}
          {plan.Variation?.length > 0 && (
            <div className={styles.variationChips}>
              {plan.Variation.map((v: any) => (
                <span key={v.id} className={styles.chip}>
                  {v.title}
                </span>
              ))}
            </div>
          )}

          {/* Images */}
          {plan.images?.length > 0 && (
            <div className={styles.planImageGrid}>
              {plan.images.map((img: any) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="plan"
                  className={styles.planImage}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <p className={styles.empty}>No plans configured yet.</p>
  )}
</div>

      </div>

      {/* MESS ADMINS */}
        <div className={styles.card}>
          <h3>Mess Admins ({mess?.messAdmins?.length || 0})</h3>

          {mess?.messAdmins && mess.messAdmins.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Added On</th>
                </tr>
              </thead>
              <tbody>
                {mess.messAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.user?.name || "-"}</td>
                    <td>{admin.user?.email || "-"}</td>
                    <td>{admin.user?.phone || "-"}</td>

                    {/* Status (hardcoded because backend doesn't send it) */}
                    <td>
                      <span className={styles.active}>Active</span>
                    </td>

                    <td>
                      {new Date(admin.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              No admins assigned yet.
            </div>
          )}
        </div>


      <div className={styles.row}>

            {/* ACTIVE SUBSCRIPTIONS */}
            <div className={styles.card}>
              <h3>Active Subscriptions ({mess?.UserSubscriptions?.length || 0})</h3>

              {mess?.UserSubscriptions?.length ? (
                <ul className={styles.list}>
                  {mess.UserSubscriptions
                    .filter((sub: any) => sub.isActive)
                    .map((sub: any) => (
                      <li key={sub.id} className={styles.subscriptionItem}>
                        <div>
                          <strong>Schedule:</strong> {sub.scheduleType}
                        </div>

                        <div>
                          <strong>Days:</strong>{" "}
                          {sub.selectedDays?.join(", ") || "-"}
                        </div>

                        <div>
                          <strong>Start:</strong>{" "}
                          {new Date(sub.start_date).toLocaleDateString("en-IN")}
                        </div>

                        <div className={styles.actions}>
                            <button
                              className={styles.iconBtn}
                              onClick={() => {
                                setEditingSub(sub);
                                setEditForm({
                                  scheduleType: sub.scheduleType,
                                  selectedDays: sub.selectedDays || [],
                                  start_date: sub.start_date.split("T")[0],
                                });
                              }}
                            >
                              <LuPencil size={18} />
                            </button>

                            <button
                              className={`${styles.iconBtn} ${styles.deleteBtn}`}
                              onClick={() => {
                                setDeleteSub(sub); // open modal
                              }}
                            >
                              <LuTrash2 size={18} />
                            </button>

                          </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className={styles.empty}>No active subscriptions.</p>
              )}
            </div>
            {/* DELIVERY PARTNERS */}
            <div className={styles.card}>
              <h3>Delivery Partners ({mess?.DeliveryPartnerProfile?.length || 0})</h3>
              {mess?.DeliveryPartnerProfile?.length ? (
                <ul className={styles.list}>
                  {mess.DeliveryPartnerProfile.map((partner: any) => (
                    <li key={partner.id}>
                      <div>
                        <strong>Status:</strong>{" "}
                        <span
                          className={
                            partner.isonline
                              ? styles.active
                              : styles.inactive
                          }
                        >
                          {partner.isonline ? "Online" : "Offline"}
                        </span>
                      </div>

                      <div>
                        <strong>Address:</strong> {partner.address || "-"}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>
                  No delivery partners assigned.
                </p>
              )}
            </div>
          </div>

            {/* GALLERY */}
      <div className={styles.card}>
        <h3>Gallery (1)</h3>
        {mess.images.length === 0 ? (
          <p>No images uploaded.</p>
        ) : (
          mess.images.map(img => (
            <img
              key={img.id}
              src={img.url}
              className={styles.image}
            />
          ))
        )}
      </div>

      {/* 🔥 PASTE MODAL RIGHT HERE */}
      {editingSub && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Edit Subscription</h3>

            <label>Schedule Type</label>
            <select
              value={editForm.scheduleType}
              onChange={(e) =>
                setEditForm({ ...editForm, scheduleType: e.target.value })
              }
            >
              <option value="EVERYDAY">Everyday</option>
              <option value="CUSTOM">Custom</option>
            </select>


            <label>Start Date</label>
            <input
              type="date"
              value={editForm.start_date}
              onChange={(e) =>
                setEditForm({ ...editForm, start_date: e.target.value })
              }
            />

            <label>Selected Days</label>
            <div className={styles.daysContainer}>
                  {DAYS.map((day) => {
                    const isSelected = editForm.selectedDays.includes(day);

                    return (
                      <button
                        key={day}
                        type="button"
                        className={`${styles.dayBtn} ${
                          isSelected ? styles.selectedDay : ""
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            // remove day
                            setEditForm({
                              ...editForm,
                              selectedDays: editForm.selectedDays.filter(
                                (d: string) => d !== day
                              ),
                            });
                          } else {
                            // add day
                            setEditForm({
                              ...editForm,
                              selectedDays: [...editForm.selectedDays, day],
                            });
                          }
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
            <div className={styles.modalActions}>
              <button
                onClick={async () => {
                  try {
                    const payload = {
                      ...editForm,
                      scheduleType: scheduleMap[editForm.scheduleType],
                    };

                    await updateUserSubscription(editingSub.id, payload);


                    setMess((prev) => {
                        if (!prev) return prev;

                        return {
                          ...prev,
                          UserSubscriptions: prev.UserSubscriptions.map((s: any) =>
                            s.id === editingSub.id
                              ? { ...s, ...editForm }
                              : s
                          ),
                        };
                      });


                    setEditingSub(null);
                  } catch (err) {
                    console.error("Update failed", err);
                  }
                }}
              >
                Save
              </button>

              <button onClick={() => setEditingSub(null)}>
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 🔥 DELETE CONFIRM MODAL — PASTE HERE */}
      <ConfirmModal
        open={!!deleteSub}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This action cannot be undone."
        onCancel={() => setDeleteSub(null)}
        onConfirm={async () => {
          if (!deleteSub) return;

          try {
            await deleteUserSubscription(deleteSub.id);

            setMess((prev) => ({
              ...prev!,
              UserSubscriptions: prev!.UserSubscriptions.filter(
                (s: any) => s.id !== deleteSub.id
              ),
            }));

            setDeleteSub(null);
          } catch (err) {
            console.error("Delete failed", err);
            setDeleteSub(null);
          }
        }}
      />
      <ConfirmModal
          open={!!deletePlanId}
          title="Delete Plan"
          message="Are you sure you want to delete this plan? This action cannot be undone."
          onCancel={() => setDeletePlanId(null)}
          onConfirm={async () => {
            if (!deletePlanId) return;

            try {
              await deletePlan(deletePlanId);

              // Remove plan from state
              setMess((prev) => {
                if (!prev) return prev;

                return {
                  ...prev,
                  plans: prev.plans.filter(
                    (p) => p.id !== deletePlanId
                  ),
                };
              });

              setDeletePlanId(null);
            } catch (err) {
              console.error("Failed to delete plan", err);
              setDeletePlanId(null);
            }
          }}
        />

      {/* CREATE PLAN MODAL */}
      <CreatePlanModal
        messId={id!}
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSuccess={handlePlanCreated}
      />
      <CreatePlanModal
        messId={id!}
        isOpen={showEditPlanModal}
        onClose={() => {
          setShowEditPlanModal(false);
          setEditingPlan(null);
        }}
        onSuccess={handlePlanCreated}
        isEdit
        plan={editingPlan}
      />

    </div>
    
  );
};

export default MessDetails;
