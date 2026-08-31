import styles from "./MessDetails.module.css";
import { LuArrowLeft, LuCalendar, LuCreditCard, LuIndianRupee, LuMail, LuMapPin, LuPackage, LuPackageCheck, LuPencil, LuPhone, LuReceipt, LuRefreshCw, LuTruck, LuPlus, LuUsers } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { getMessById, getMessStats, type MessDetailsResponse, type MessStats } from "../../services/mess.api";
import CreatePlanModal from "../../components/ui/CreatePlanModal/CreatePlanModal";
import CreateMenuModal from "../../components/ui/CreateMenuModal/CreateMenuModal";
import { getMenusByMess, deleteMenu as deleteMenuApi, type MenuResponse } from "../../services/menu.api";
import { getMessBillingInvoice, settleMessBillingInvoice, updateMessBillingConfig } from "../../services/billing.api";
import type { BillingMessInvoice, BillingMessInvoiceApiResponse } from "../../types/billing.types";

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


const MONTH_OPTIONS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const getCurrentYear = () => new Date().getFullYear();

const getCurrentMonth = () => {
  const today = new Date();
  return String(today.getMonth() + 1).padStart(2, "0");
};

const getYearOptions = () => {
  const currentYear = getCurrentYear();
  return [currentYear, currentYear - 1, currentYear - 2];
};

const toUsageMonth = (year: number, month: string) => `${year}-${month}`;

const unwrapInvoice = (
  response: BillingMessInvoiceApiResponse
): BillingMessInvoice => {
  const maybeWrapped = response as { data?: BillingMessInvoice };

  if (
    maybeWrapped.data &&
    typeof maybeWrapped.data === "object" &&
    "id" in maybeWrapped.data
  ) {
    return maybeWrapped.data;
  }

  return response as BillingMessInvoice;
};

const formatCurrency = (value?: string | number | null) =>
  `Rs. ${Number(value ?? 0).toLocaleString("en-IN")}`;

const formatDate = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatMonthLabel = (value: string) => {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      response?: {
        data?: {
          message?: string | string[];
        };
      };
      message?: string;
    };

    const message = err.response?.data?.message;
    if (message) {
      return Array.isArray(message) ? message.join(", ") : message;
    }

    if (err.message) return err.message;
  }

  return fallback;
};


const MessDetails = () => {
const navigate = useNavigate();
const { id } = useParams();
const { showToast } = useToast();
const showToastRef = useRef(showToast);
const [mess, setMess] = useState<MessDetailsResponse | null>(null);

const [stats, setStats] = useState<MessStats | null>(null);
const [invoice, setInvoice] = useState<BillingMessInvoice | null>(null);
const [invoiceYear, setInvoiceYear] = useState(getCurrentYear);
const [invoiceMonth, setInvoiceMonth] = useState(getCurrentMonth);
const [invoiceLoading, setInvoiceLoading] = useState(false);
const [invoiceError, setInvoiceError] = useState<string | null>(null);
const [invoiceReloadKey, setInvoiceReloadKey] = useState(0);
const [showSettleModal, setShowSettleModal] = useState(false);
const [settleYear, setSettleYear] = useState(getCurrentYear);
const [settleMonth, setSettleMonth] = useState(getCurrentMonth);
const [settling, setSettling] = useState(false);
const [showExtendModal, setShowExtendModal] = useState(false);
const [extendTrialDate, setExtendTrialDate] = useState("");
const [extendRate, setExtendRate] = useState("");
const [extending, setExtending] = useState(false);

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

const [menus, setMenus] = useState<MenuResponse[]>([]);
const [menusLoading, setMenusLoading] = useState(false);
const [showMenuModal, setShowMenuModal] = useState(false);
const [editingMenu, setEditingMenu] = useState<MenuResponse | null>(null);
const [showEditMenuModal, setShowEditMenuModal] = useState(false);
const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null);
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
const yearOptions = getYearOptions();
const invoiceUsageMonth = toUsageMonth(invoiceYear, invoiceMonth);
const settleUsageMonth = toUsageMonth(settleYear, settleMonth);

const getInvoiceStatusClass = (status: string) => {
  switch (status.toUpperCase()) {
    case "PAID":
      return styles.invoiceStatusPaid;
    case "OVERDUE":
      return styles.invoiceStatusOverdue;
    case "PENDING":
      return styles.invoiceStatusPending;
    default:
      return styles.invoiceStatusNeutral;
  }
};


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

useEffect(() => {
  showToastRef.current = showToast;
}, [showToast]);

const fetchMenus = async () => {
  if (!id) return;
  try {
    setMenusLoading(true);
    const res = await getMenusByMess(id);
    setMenus(res.data?.data || []);
  } catch (err) {
    console.error("Failed to load menus", err);
  } finally {
    setMenusLoading(false);
  }
};

useEffect(() => {
  fetchMenus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

// CreateMenuModal shows its own success toast — this just refreshes the list.
const handleMenuSaved = async () => {
  await fetchMenus();
};

useEffect(() => {
  if (!id) return;

  const fetchInvoice = async () => {
    try {
      setInvoiceLoading(true);
      setInvoiceError(null);

      const res = await getMessBillingInvoice(id, invoiceUsageMonth);
      setInvoice(unwrapInvoice(res.data));
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to load billing invoice");
      setInvoice(null);
      setInvoiceError(message);
      showToastRef.current(message, "error");
    } finally {
      setInvoiceLoading(false);
    }
  };

  fetchInvoice();
}, [id, invoiceUsageMonth, invoiceReloadKey]);

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

const openSettleModal = () => {
  setSettleYear(getCurrentYear());
  setSettleMonth(getCurrentMonth());
  setShowSettleModal(true);
};

const handleSettleInvoice = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (!id) return;

  try {
    setSettling(true);
    const res = await settleMessBillingInvoice(id, {
      month: settleUsageMonth,
    });
    const settledInvoice = unwrapInvoice(res.data);

    setInvoice(settledInvoice);
    setInvoiceYear(settleYear);
    setInvoiceMonth(settleMonth);
    setInvoiceError(null);
    setShowSettleModal(false);
    showToast("Invoice settled successfully", "success");
  } catch (err) {
    showToast(getApiErrorMessage(err, "Failed to settle invoice"), "error");
  } finally {
    setSettling(false);
  }
};

const openExtendModal = () => {
  setExtendTrialDate("");
  setExtendRate(invoice?.rate ?? "");
  setShowExtendModal(true);
};

const handleExtendBillingConfig = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();
  if (!id) return;

  const rate = Number(extendRate);

  if (!extendTrialDate) {
    showToast("Trial end date is required", "error");
    return;
  }

  if (!Number.isFinite(rate) || rate < 0) {
    showToast("Per customer rate override must be 0 or more", "error");
    return;
  }

  try {
    setExtending(true);
    await updateMessBillingConfig(id, {
      trialEndsAt: `${extendTrialDate}T23:59:59.000Z`,
      perCustomerRateOverride: rate,
    });

    setShowExtendModal(false);
    setInvoiceReloadKey((key) => key + 1);
    showToast("Billing config updated successfully", "success");
  } catch (err) {
    showToast(
      getApiErrorMessage(err, "Failed to update billing config"),
      "error"
    );
  } finally {
    setExtending(false);
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

        <div className={styles.headerActions}>
          <button
            type="button"
            className={`${styles.headerActionBtn} ${styles.settleBtn}`}
            onClick={openSettleModal}
          >
            <LuReceipt size={17} /> Settle
          </button>

          <button
            type="button"
            className={`${styles.headerActionBtn} ${styles.extendBtn}`}
            onClick={openExtendModal}
          >
            <LuCalendar size={17} /> Extend
          </button>
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

      {/* BILLING INVOICE */}
      <section className={`${styles.card} ${styles.invoiceSection}`}>
        <div className={styles.invoiceHeader}>
          <div className={styles.invoiceTitle}>
            <div className={styles.invoiceIcon}>
              <LuReceipt size={22} />
            </div>
            <div>
              <h3>Billing Invoice</h3>
              <span>{formatMonthLabel(invoiceUsageMonth)}</span>
            </div>
          </div>

          <div className={styles.invoiceFilters}>
            <label className={styles.monthFilter}>
              <span>Year</span>
              <select
                value={invoiceYear}
                onChange={(event) => setInvoiceYear(Number(event.target.value))}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.monthFilter}>
              <span>Month</span>
              <select
                value={invoiceMonth}
                onChange={(event) => setInvoiceMonth(event.target.value)}
              >
                {MONTH_OPTIONS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {invoiceLoading ? (
          <div className={styles.invoiceState}>
            <div className={styles.invoiceSpinner} />
            <span>Loading invoice...</span>
          </div>
        ) : invoiceError ? (
          <div className={styles.invoiceState}>
            <span>{invoiceError}</span>
            <button
              type="button"
              onClick={() => setInvoiceReloadKey((key) => key + 1)}
            >
              <LuRefreshCw size={16} /> Retry
            </button>
          </div>
        ) : invoice ? (
          <>
            <div className={styles.invoiceSummaryGrid}>
              <div className={styles.invoiceMetric}>
                <span>Amount</span>
                <strong>{formatCurrency(invoice.amount)}</strong>
              </div>

              <div className={styles.invoiceMetric}>
                <span>Customer Count</span>
                <strong>{invoice.customerCount.toLocaleString("en-IN")}</strong>
              </div>

              <div className={styles.invoiceMetric}>
                <span>Rate</span>
                <strong>{formatCurrency(invoice.rate)}</strong>
              </div>

              <div className={styles.invoiceMetric}>
                <span>Status</span>
                <strong
                  className={`${styles.invoiceStatus} ${getInvoiceStatusClass(
                    invoice.status
                  )}`}
                >
                  {invoice.status}
                </strong>
              </div>
            </div>

            <div className={styles.invoiceMetaGrid}>
              <div>
                <span><LuCalendar size={16} /> Billing Period</span>
                <strong>
                  {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                </strong>
              </div>

              <div>
                <span><LuCreditCard size={16} /> Due Date</span>
                <strong>{formatDate(invoice.dueDate)}</strong>
              </div>

              <div>
                <span><LuCreditCard size={16} /> Paid At</span>
                <strong>{formatDate(invoice.paidAt)}</strong>
              </div>

              <div>
                <span><LuUsers size={16} /> Invoice ID</span>
                <strong>{invoice.id}</strong>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.invoiceState}>
            <span>No invoice found for {formatMonthLabel(invoiceUsageMonth)}.</span>
          </div>
        )}
      </section>

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

          {/* Connected Menus */}
          {plan.menus?.length > 0 && (
            <div className={styles.variationChips}>
              {plan.menus.map((m: any) => (
                <span key={m.id} className={styles.tagBlue}>
                  {m.name}
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

      {/* MENUS */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Menus ({menus.length})</h3>
          <button
            type="button"
            className={styles.addPlanBtn}
            onClick={() => setShowMenuModal(true)}
          >
            <LuPlus size={18} /> Add Menu
          </button>
        </div>

        {menusLoading ? (
          <p className={styles.empty}>Loading menus...</p>
        ) : menus.length > 0 ? (
          <div className={styles.planGrid}>
            {menus.map((menu) => {
              const dayCount = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
                .filter((d) => ((menu as any)[d]?.length ?? 0) > 0).length;

              return (
                <div key={menu.id} className={styles.planCard}>
                  <div className={styles.planHeader}>
                    <h4>{menu.name}</h4>
                    <div className={styles.planHeaderRight}>
                      <button
                        className={styles.editPlanBtn}
                        onClick={() => {
                          setEditingMenu(menu);
                          setShowEditMenuModal(true);
                        }}
                      >
                        <LuPencil size={16} />
                      </button>
                      <button
                        className={styles.deletePlanBtn}
                        onClick={() => setDeleteMenuId(menu.id)}
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className={styles.planDescription}>
                    Scheduled for {dayCount} day{dayCount === 1 ? "" : "s"} of the week
                  </p>
                  {!menu.isActive && <span className={styles.tagBlue}>Inactive</span>}
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.empty}>No menus configured yet.</p>
        )}
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
              <div className={styles.cardHeader}>
                <h3>Delivery Partners ({mess?.DeliveryPartnerProfile?.length || 0})</h3>
                <button
                  type="button"
                  className={styles.addPlanBtn}
                  onClick={() => navigate(`/delivery-agents/add?messId=${id}`)}
                >
                  <LuPlus size={18} /> Add Delivery Partner
                </button>
              </div>
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
      {showSettleModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => !settling && setShowSettleModal(false)}
        >
          <form
            className={`${styles.modal} ${styles.billingModal}`}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSettleInvoice}
          >
            <div className={styles.billingModalHeader}>
              <div>
                <h3>Settle Invoice</h3>
                <p>Select the usage month to settle.</p>
              </div>
              <span>{settleUsageMonth}</span>
            </div>

            <div className={styles.billingFormGrid}>
              <label>
                Year
                <select
                  value={settleYear}
                  onChange={(event) => setSettleYear(Number(event.target.value))}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Month
                <select
                  value={settleMonth}
                  onChange={(event) => setSettleMonth(event.target.value)}
                >
                  {MONTH_OPTIONS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.modalActions}>
              <button type="submit" disabled={settling}>
                {settling ? "Settling..." : "Settle"}
              </button>

              <button
                type="button"
                disabled={settling}
                onClick={() => setShowSettleModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showExtendModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => !extending && setShowExtendModal(false)}
        >
          <form
            className={`${styles.modal} ${styles.billingModal}`}
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleExtendBillingConfig}
          >
            <div className={styles.billingModalHeader}>
              <div>
                <h3>Extend Billing</h3>
                <p>Update trial end date and rate override.</p>
              </div>
            </div>

            <div className={styles.billingFormGrid}>
              <label>
                Trial Ends At
                <input
                  type="date"
                  value={extendTrialDate}
                  onChange={(event) => setExtendTrialDate(event.target.value)}
                />
              </label>

              <label>
                Per Customer Rate Override
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="10"
                  value={extendRate}
                  onChange={(event) => setExtendRate(event.target.value)}
                />
              </label>
            </div>

            <div className={styles.modalActions}>
              <button type="submit" disabled={extending}>
                {extending ? "Submitting..." : "Submit"}
              </button>

              <button
                type="button"
                disabled={extending}
                onClick={() => setShowExtendModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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

      {/* CREATE / EDIT MENU MODAL */}
      <CreateMenuModal
        messId={id!}
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        onSuccess={handleMenuSaved}
      />
      <CreateMenuModal
        messId={id!}
        isOpen={showEditMenuModal}
        onClose={() => {
          setShowEditMenuModal(false);
          setEditingMenu(null);
        }}
        onSuccess={handleMenuSaved}
        isEdit
        menu={editingMenu}
      />

      <ConfirmModal
        open={!!deleteMenuId}
        title="Delete Menu"
        message="Are you sure you want to delete this menu? This action cannot be undone."
        onCancel={() => setDeleteMenuId(null)}
        onConfirm={async () => {
          if (!deleteMenuId) return;
          try {
            await deleteMenuApi(deleteMenuId);
            setMenus((prev) => prev.filter((m) => m.id !== deleteMenuId));
            setDeleteMenuId(null);
          } catch (err) {
            console.error("Failed to delete menu", err);
            setDeleteMenuId(null);
          }
        }}
      />

    </div>
    
  );
};

export default MessDetails;
