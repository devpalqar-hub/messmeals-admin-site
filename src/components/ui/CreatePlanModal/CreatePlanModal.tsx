import { useState, useEffect } from "react";
import { LuX } from "react-icons/lu";
import styles from "./CreatePlanModal.module.css";
import api from "../../../services/axios";
import { addPlanImages, createPlan, removePlanImage, updatePlan } from "../../../services/plans.api";
import type { Plan } from "../../../types/plan.types";import { useToast } from "../Toast/ToastContainer";

interface CreatePlanModalProps {
  messId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isEdit?: boolean;
  plan?: Plan | null;
}

export default function CreatePlanModal({
  messId,
  isOpen,
  onClose,
  onSuccess,
  isEdit = false,
  plan = null,
}: CreatePlanModalProps) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    planName: "",
    price: "",
    minPrice: "",
    description: "",
    isMonthlyPlan: true,
    isDailyPlan: false,
  });

  const [variationList, setVariationList] = useState<
    Array<{ id: string; title: string; isActive: boolean }>
  >([]);
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  const [planImages, setPlanImages] = useState<File[]>([]);
  const [planPreviews, setPlanPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<
  Array<{ id: string; url: string }>
>([]);

const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
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
    if (!plan || !isEdit) return;

    setForm({
      planName: plan.planName || "",
      price: String(plan.price || ""),
      minPrice: String(plan.minPrice || ""),
      description: plan.description || "",
      isMonthlyPlan: plan.isMonthlyPlan,
      isDailyPlan: plan.isDailyPlan,
    });

    setSelectedVariations(
      plan.Variation?.map((v) => v.id) || []
    );

    setExistingImages(plan.images || []);
    setPlanPreviews([]);
    setPlanImages([]);
  }, [plan, isEdit]);

  const handleVariationChange = (id: string) => {
    setSelectedVariations((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

const handleSubmit = async () => {
  try {
    setLoading(true);

    if (!form.planName || !form.price || !form.description) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (selectedVariations.length === 0) {
      showToast("Please select at least one variation", "error");
      return;
    }

    if (isEdit && plan) {
      await updatePlan(plan.id, {
        planName: form.planName,
        price: form.price,
        minPrice: form.minPrice,
        description: form.description,
        variationIds: selectedVariations,
        isMonthlyPlan: form.isMonthlyPlan,
        isDailyPlan: form.isDailyPlan,
      });
      if (deletedImageIds.length > 0) {
        await Promise.all(
          deletedImageIds.map((imageId) =>
            removePlanImage(plan.id, imageId)
          )
        );
      }

      // upload new images
      if (planImages.length > 0) {
        await addPlanImages(plan.id, planImages);
      }

      showToast("Plan updated successfully", "success");
    } else {
      await createPlan({
        planName: form.planName,
        price: form.price,
        minPrice: form.minPrice,
        description: form.description,
        messId,
        variationIds: selectedVariations,
        isMonthlyPlan: form.isMonthlyPlan,
        isDailyPlan: form.isDailyPlan,
        planImages,
      });

      showToast("Plan created successfully", "success");
    }

    handleReset();
    onSuccess();
  } catch (error: any) {
    console.error("Plan operation failed", error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to save plan";

    showToast(errorMessage, "error");
  } finally {
    setLoading(false);
  }
};

  const handleReset = () => {
    setForm({
      planName: "",
      price: "",
      minPrice: "",
      description: "",
      isMonthlyPlan: true,
      isDailyPlan: false,
    });
    setSelectedVariations([]);
    setPlanImages([]);
    setPlanPreviews([]);
    setExistingImages([]);
    setDeletedImageIds([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleReset}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isEdit ? "Edit Plan" : "Create New Plan"}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleReset}
          >
            <LuX size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {/* PLAN NAME */}
          <div className={styles.formGroup}>
            <label>Plan Name *</label>
            <input
              type="text"
              name="planName"
              value={form.planName}
              onChange={handleFormChange}
              placeholder="e.g., Weekly Lunch Plan"
            />
          </div>

          {/* PRICE ROW */}
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Price *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleFormChange}
                placeholder="999"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Min Price</label>
              <input
                type="number"
                name="minPrice"
                value={form.minPrice}
                onChange={handleFormChange}
                placeholder="799"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className={styles.formGroup}>
            <label>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Describe this plan..."
              rows={3}
            />
          </div>

          {/* PLAN TYPE */}
          <div className={styles.formGroup}>
            <label>Plan Type</label>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isMonthlyPlan"
                  checked={form.isMonthlyPlan}
                  onChange={handleFormChange}
                />
                <span>Monthly Plan</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isDailyPlan"
                  checked={form.isDailyPlan}
                  onChange={handleFormChange}
                />
                <span>Daily Plan</span>
              </label>
            </div>
          </div>

          {/* VARIATIONS */}
          <div className={styles.formGroup}>
            <label>Variations *</label>
            <div className={styles.variationGrid}>
              {variationList
                .filter((v) => v.isActive)
                .map((variation) => (
                  <label key={variation.id} className={styles.variationItem}>
                    <input
                      type="checkbox"
                      checked={selectedVariations.includes(variation.id)}
                      onChange={() => handleVariationChange(variation.id)}
                    />
                    <span>{variation.title}</span>
                  </label>
                ))}
            </div>
            {variationList.length === 0 && (
              <p className={styles.emptyText}>No variations available</p>
            )}
          </div>

          {/* PLAN IMAGES */}
          <div className={styles.formGroup}>
            <label>Plan Images</label>
            <label className={styles.uploadBox}>
              <p>Click to upload images</p>
              <span>PNG, JPG up to 5MB</span>
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg"
                hidden
                onChange={(e) => {
                  if (!e.target.files) return;

                  const selectedFiles = Array.from(e.target.files);
                  const newPreviews = selectedFiles.map((file) =>
                    URL.createObjectURL(file)
                  );

                  setPlanImages((prev) => [...prev, ...selectedFiles]);
                  setPlanPreviews((prev) => [...prev, ...newPreviews]);
                }}
              />
            </label>

            {/* Existing Images */}
{existingImages.length > 0 && (
  <div className={styles.previewGrid}>
    {existingImages.map((img, i) => (
      <div key={img.id} className={styles.previewItem}>
        <img
          src={img.url}
          alt="existing"
          className={styles.previewImage}
        />

        <button
          type="button"
          className={styles.removePreviewBtn}
          onClick={() => {
            setDeletedImageIds((prev) => [
              ...prev,
              img.id,
            ]);

            setExistingImages((prev) =>
              prev.filter((_, index) => index !== i)
            );
          }}
        >
          ×
        </button>
      </div>
    ))}
  </div>
)}

{/* New Images */}
{planPreviews.length > 0 && (
  <div className={styles.previewGrid}>
    {planPreviews.map((src, i) => (
      <div key={i} className={styles.previewItem}>
        <img
          src={src}
          alt="plan preview"
          className={styles.previewImage}
        />

        <button
          type="button"
          className={styles.removePreviewBtn}
          onClick={() => {
            const updatedFiles = [...planImages];
            const updatedPreviews = [...planPreviews];

            URL.revokeObjectURL(updatedPreviews[i]);

            updatedFiles.splice(i, 1);
            updatedPreviews.splice(i, 1);

            setPlanImages(updatedFiles);
            setPlanPreviews(updatedPreviews);
          }}
        >
          ×
        </button>
      </div>
    ))}
  </div>
)}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleReset}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.createBtn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update Plan"
              : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
