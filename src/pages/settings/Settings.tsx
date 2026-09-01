import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  FiAlertTriangle,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiRefreshCw,
  FiRotateCcw,
  FiSave,
} from "react-icons/fi";
import { useToast } from "../../components/ui/Toast/ToastContainer";
import {
  getBillingGlobalConfig,
  updateBillingGlobalConfig,
} from "../../services/billing.api";
import type {
  BillingGlobalConfig,
  BillingGlobalConfigApiResponse,
  BillingGlobalConfigPayload,
} from "../../types/billing.types";
import styles from "./Settings.module.css";

type FormState = {
  defaultPerCustomerRate: string;
  defaultTrialDays: string;
  dueDaysBeforePeriodEnd: string;
  graceDaysAfterDue: string;
};

const emptyForm: FormState = {
  defaultPerCustomerRate: "",
  defaultTrialDays: "",
  dueDaysBeforePeriodEnd: "",
  graceDaysAfterDue: "",
};

const unwrapConfig = (
  response: BillingGlobalConfigApiResponse
): BillingGlobalConfig => {
  const maybeWrapped = response as { data?: BillingGlobalConfig };

  if (
    maybeWrapped.data &&
    typeof maybeWrapped.data === "object" &&
    "id" in maybeWrapped.data
  ) {
    return maybeWrapped.data;
  }

  return response as BillingGlobalConfig;
};

const configToForm = (config: BillingGlobalConfig): FormState => ({
  defaultPerCustomerRate: String(config.defaultPerCustomerRate ?? ""),
  defaultTrialDays: String(config.defaultTrialDays ?? ""),
  dueDaysBeforePeriodEnd: String(config.dueDaysBeforePeriodEnd ?? ""),
  graceDaysAfterDue: String(config.graceDaysAfterDue ?? ""),
});

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as any;
    const message = err.response?.data?.message;
    if (message) {
      if (Array.isArray(message)) return message.map((m) => (typeof m === "string" ? m : JSON.stringify(m))).join(", ");
      if (typeof message === "string") return message;
      if (typeof message === "object" && message !== null) {
        if (typeof message.message === "string") return message.message;
        return JSON.stringify(message);
      }
    }
    if (err.message && typeof err.message === "string") return err.message;
  }
  return fallback;
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const validateForm = (form: FormState): string | null => {
  const rate = Number(form.defaultPerCustomerRate);
  const trialDays = Number(form.defaultTrialDays);
  const dueDays = Number(form.dueDaysBeforePeriodEnd);
  const graceDays = Number(form.graceDaysAfterDue);

  if (!Number.isFinite(rate) || rate < 0) {
    return "Default per customer rate must be 0 or more";
  }

  const dayFields = [
    { label: "Default trial days", value: trialDays },
    { label: "Due days before period end", value: dueDays },
    { label: "Grace days after due", value: graceDays },
  ];

  const invalidDayField = dayFields.find(
    (field) =>
      !Number.isFinite(field.value) ||
      field.value < 0 ||
      !Number.isInteger(field.value)
  );

  if (invalidDayField) {
    return `${invalidDayField.label} must be a whole number 0 or more`;
  }

  return null;
};

const Settings = () => {
  const { showToast } = useToast();
  const [config, setConfig] = useState<BillingGlobalConfig | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(
    async (toastOnError = false) => {
      try {
        setLoading(true);
        setError(null);
        const res = await getBillingGlobalConfig();
        const nextConfig = unwrapConfig(res.data);
        setConfig(nextConfig);
        setForm(configToForm(nextConfig));
      } catch (err) {
        const message = getErrorMessage(
          err,
          "Failed to load billing settings"
        );
        setError(message);
        if (toastOnError) showToast(message, "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const originalForm = useMemo(
    () => (config ? configToForm(config) : emptyForm),
    [config]
  );

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(originalForm),
    [form, originalForm]
  );

  const payload = useMemo<BillingGlobalConfigPayload>(
    () => ({
      defaultPerCustomerRate: Number(form.defaultPerCustomerRate),
      defaultTrialDays: Number(form.defaultTrialDays),
      dueDaysBeforePeriodEnd: Number(form.dueDaysBeforePeriodEnd),
      graceDaysAfterDue: Number(form.graceDaysAfterDue),
    }),
    [form]
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setForm(originalForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm(form);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    try {
      setSaving(true);
      const res = await updateBillingGlobalConfig(payload);
      const nextConfig = unwrapConfig(res.data);
      setConfig(nextConfig);
      setForm(configToForm(nextConfig));
      showToast("Billing settings updated successfully", "success");
    } catch (err) {
      showToast(
        getErrorMessage(err, "Failed to update billing settings"),
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading && !config) {
    return (
      <div className={styles.centerState}>
        <div className={styles.spinner} />
        <p>Loading settings...</p>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className={styles.centerState}>
        <div className={styles.errorIcon}>
          <FiAlertTriangle />
        </div>
        <h3>Unable to load settings</h3>
        <p>{error}</p>
        <button
          className={styles.primaryButton}
          onClick={() => loadConfig(true)}
          type="button"
        >
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Settings</h1>
          <p>Billing defaults and due date rules</p>
        </div>

        <button
          className={styles.secondaryButton}
          disabled={loading || saving}
          onClick={() => loadConfig(true)}
          type="button"
        >
          <FiRefreshCw className={loading ? styles.spinIcon : ""} />
          Refresh
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiDollarSign />
          </div>
          <span>Customer Rate</span>
          <strong>Rs. {form.defaultPerCustomerRate || "0"}</strong>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCalendar />
          </div>
          <span>Trial Days</span>
          <strong>{form.defaultTrialDays || "0"}</strong>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiClock />
          </div>
          <span>Due Before End</span>
          <strong>{form.dueDaysBeforePeriodEnd || "0"} days</strong>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiRefreshCw />
          </div>
          <span>Grace Period</span>
          <strong>{form.graceDaysAfterDue || "0"} days</strong>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Global Billing Configuration</h2>
              <p>Values are applied as system defaults.</p>
            </div>
            {hasChanges && <span className={styles.dirtyBadge}>Unsaved</span>}
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Default Per Customer Rate</span>
              <div className={styles.inputWithPrefix}>
                <span>Rs.</span>
                <input
                  min="0"
                  name="defaultPerCustomerRate"
                  onChange={handleChange}
                  placeholder="0"
                  step="0.01"
                  type="number"
                  value={form.defaultPerCustomerRate}
                />
              </div>
            </label>

            <label className={styles.field}>
              <span>Default Trial Days</span>
              <input
                min="0"
                name="defaultTrialDays"
                onChange={handleChange}
                placeholder="0"
                step="1"
                type="number"
                value={form.defaultTrialDays}
              />
            </label>

            <label className={styles.field}>
              <span>Due Days Before Period End</span>
              <input
                min="0"
                name="dueDaysBeforePeriodEnd"
                onChange={handleChange}
                placeholder="0"
                step="1"
                type="number"
                value={form.dueDaysBeforePeriodEnd}
              />
            </label>

            <label className={styles.field}>
              <span>Grace Days After Due</span>
              <input
                min="0"
                name="graceDaysAfterDue"
                onChange={handleChange}
                placeholder="0"
                step="1"
                type="number"
                value={form.graceDaysAfterDue}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.ghostButton}
              disabled={!hasChanges || saving}
              onClick={handleReset}
              type="button"
            >
              <FiRotateCcw /> Reset Changes
            </button>

            <button
              className={styles.primaryButton}
              disabled={!hasChanges || saving || loading}
              type="submit"
            >
              {saving ? (
                <>
                  <span className={styles.buttonSpinner} />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave /> Save Settings
                </>
              )}
            </button>
          </div>
        </form>

        <aside className={styles.metaCard}>
          <h2>Configuration Details</h2>

          <div className={styles.metaList}>
            <div>
              <span>Config ID</span>
              <strong>{config?.id ?? "-"}</strong>
            </div>

            <div>
              <span>Created</span>
              <strong>{formatDateTime(config?.createdAt)}</strong>
            </div>

            <div>
              <span>Last Updated</span>
              <strong>{formatDateTime(config?.updatedAt)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Settings;
