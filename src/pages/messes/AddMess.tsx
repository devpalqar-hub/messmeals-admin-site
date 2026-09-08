import styles from "./AddMess.module.css";
import { LuArrowLeft, LuPlus } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { createMess, uploadCoverImage } from "../../services/addMess.api";
import { getMessOwners, createMessWithOwner } from "../../services/messOwners.api";
import { uploadFile } from "../../services/upload.service";
import { useToast } from "../../components/ui/Toast/ToastContainer";

interface MessOwner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_verified?: boolean;
  is_active?: boolean;
  messAdminProfile?: {
    id: string;
    messes?: {
      id: string;
      name: string;
    }[];
  };
}

export default function AddMess() {
  const navigate = useNavigate();


  /* ---------------- FORM STATE ---------------- */

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    location: "",
    latitude: "",
    longitude: "",
    is_active: true,
    is_verified: false,
    isPremium: false,
  });

  const { showToast } = useToast();

  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [messAdminIds, setMessAdminIds] = useState<string[]>([]);
  const [selectedAdmins, setSelectedAdmins] = useState<MessOwner[]>([]);
  const [owners, setOwners] = useState<MessOwner[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Mess owner: either pick an existing owner, or create a brand-new owner
  // account directly (superadmin one-call flow: POST /auth/superadmin/mess).
  const [ownerMode, setOwnerMode] = useState<"existing" | "new">("existing");
  const [newOwner, setNewOwner] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleNewOwnerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOwner((prev) => ({ ...prev, [name]: value }));
  };
  const [ownerPage, setOwnerPage] = useState(1);
  const [ownerLimit] = useState(5);
  const [ownerTotalPages, setOwnerTotalPages] = useState(1);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const FOOD_TYPE_OPTIONS = ["VEG", "NON_VEG", "MIXED"] as const;

  const TAG_OPTIONS = [
    "HOME_STYLE_FOOD",
    "MONTHLY_PLANS",
    "DAILY_FRESH_MEALS",
    "FIXED_MENU",
    "HYGIENIC_KITCHEN",
    "AFFORDABLE_PRICING",
    "VEG_AND_NON_VEG",
    "ON_TIME_SERVING",
    "QUALITY_INGREDIENTS",
    "CONSISTENT_TASTE",
    "STUDENT_FRIENDLY",
    "FAMILY_MESS",
    "FLEXIBLE_BOOKING",
    "NO_HIDDEN_CHARGES",
    "TRUSTED_MESS",
  ] as const;


  // 🔥 PLAN STATE - REMOVED
  // const [planForm, setPlanForm] = useState({
  //   planName: "",
  //   price: "",
  //   minPrice: "",
  //   description: "",
  //   isMonthlyPlan: true,
  //   isDailyPlan: false,
  // });

  // const [variationList, setVariationList] = useState<
  //   Array<{ id: string; title: string; isActive: boolean }>
  // >([]);
  // const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  // const [planImages, setPlanImages] = useState<File[]>([]);
  // const [planPreviews, setPlanPreviews] = useState<string[]>([]);



  // useEffect(() => {
  //   const fetchVariations = async () => {
  //     try {
  //       const res = await api.get("/variation/");
  //       setVariationList(res.data); // 🔥 your API returns array directly
  //     } catch (error) {
  //       console.error("Failed to fetch variations", error);
  //     }
  //   };

  //   fetchVariations();
  // }, []);


  // const handleVariationChange = (id: string) => {
  //   setSelectedVariations((prev) =>
  //     prev.includes(id)
  //       ? prev.filter((item) => item !== id)
  //       : [...prev, id]
  //   );
  // };

  useEffect(() => {
    if (!showAdminModal) return;

    const fetchOwners = async () => {
      try {
        setOwnersLoading(true);
        const res = await getMessOwners(ownerPage, ownerLimit);
        setOwners(res.data.data || []);
        setOwnerTotalPages(res.data.meta?.totalPages ?? 1);
      } catch (error) {
        console.error("Failed to fetch mess admins", error);
      } finally {
        setOwnersLoading(false);
      }
    };

    fetchOwners();
  }, [showAdminModal, ownerPage, ownerLimit]);

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);



  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const name = target.name;
    const value = target.value;
    const type = target.type;
    const checked = target instanceof HTMLInputElement ? target.checked : false;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdminModalClose = () => {
    setShowAdminModal(false);
    setOwnerPage(1);
  };

  const handleToggleAdmin = (owner: MessOwner) => {
    const profileId = owner.messAdminProfile?.id;
    if (!profileId) return;

    const alreadySelected = messAdminIds.includes(profileId);

    if (alreadySelected) {
      setMessAdminIds((prev) => prev.filter((id) => id !== profileId));
      setSelectedAdmins((prev) => prev.filter((item) => item.id !== owner.id));
      return;
    }

    setMessAdminIds((prev) => [...prev, profileId]); // ✅ FIXED
    setSelectedAdmins((prev) => [...prev, owner]);
  };

  const getErrorMessage = (error: unknown): string => {
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
    return "Something went wrong";
  };

  const handleSubmit = async () => {
    if (ownerMode === "new") {
      if (!newOwner.name || !newOwner.email || !newOwner.phone || !newOwner.password) {
        showToast("Please fill in all new owner fields (name, email, phone, password)", "error");
        return;
      }
      if (newOwner.password.length < 6) {
        showToast("Owner password must be at least 6 characters", "error");
        return;
      }
    }

    try {
      setLoading(true);

      let messId: string | undefined;

      if (ownerMode === "new") {
        // Upload gallery images to S3 first, same as the plain create-mess flow.
        let imageUrls: Array<{ url: string }> = [];
        if (files.length > 0) {
          const uploaded = await Promise.all(files.map((file) => uploadFile(file)));
          imageUrls = uploaded.map((url) => ({ url }));
        }

        const res = await createMessWithOwner({
          owner: newOwner,
          mess: {
            ...form,
            foodTypes,
            tags,
          },
          images: imageUrls.length > 0 ? imageUrls : undefined,
        });

        messId = res.data?.mess?.id;
      } else {
        const res = await createMess({
          ...form,
          messAdminIds,
          foodTypes,
          tags,
          files,
        });

        messId = res.data?.data?.id;
      }

      if (coverImage && messId) {
        console.log("Cover image exists?", coverImage);
        await uploadCoverImage(messId, coverImage);
      }

      showToast(
        ownerMode === "new"
          ? "Mess owner and mess created successfully"
          : "Mess created successfully",
        "success"
      );
      navigate("/messes");
    } catch (error: unknown) {
      console.error("Create mess failed", error);
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };


  /* ---------------- UI ---------------- */

  return (
    <div className={styles.wrapper}>
      {/* Back */}
      <div className={styles.back} onClick={() => navigate(-1)}>
        <LuArrowLeft /> Back to Messes
      </div>

      {/* BASIC INFO */}
      <div className={styles.card}>
        <h3>Basic Information</h3>

        <div className={styles.grid}>
          <div>
            <label>Mess Name *</label>
            <input name="name" placeholder="Enter mess name" onChange={handleChange} />
          </div>

          <div>
            <label>Phone *</label>
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
              onInput={(e) => {
                const input = e.target as HTMLInputElement;
                input.value = input.value.replace(/[^0-9]/g, "").slice(0, 10);
              }}
            />
          </div>

          <div>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              placeholder="mess@email.com"
              onChange={handleChange}
            />
          </div>


          <div>
            <label>Location</label>
            <input name="location" placeholder="City, State" onChange={handleChange} />
          </div>

          <div>
            <label>Address</label>
            <input name="address" placeholder="Full address" onChange={handleChange} />
          </div>

          <div>
            <label>Latitude</label>
            <input
              name="latitude"
              type="text"
              inputMode="decimal"
              placeholder="9.9312"
              value={form.latitude}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Longitude</label>
            <input
              name="longitude"
              type="text"
              inputMode="decimal"
              placeholder="76.2673"
              value={form.longitude}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.fullWidth}>
          <label>Description</label>
          <textarea name="description" placeholder="Describe the mess..." onChange={handleChange} />
        </div>
      </div>

      {/* STATUS */}
      <div className={styles.card}>
        <h3>Status</h3>

        <div className={styles.switchGroup}>
          <div className={styles.switchItem}>
            <label className={styles.switch}>
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              <span className={styles.slider}></span>
            </label>
            <span>Active</span>
          </div>

          <div className={styles.switchItem}>
            <label className={styles.switch}>
              <input
                type="checkbox"
                name="is_verified"
                checked={form.is_verified}
                onChange={handleChange}
              />
              <span className={styles.slider}></span>
            </label>
            <span>Verified</span>
          </div>

          <div className={styles.switchItem}>
            <label className={styles.switch}>
              <input
                type="checkbox"
                name="isPremium"
                checked={form.isPremium}
                onChange={handleChange}
              />
              <span className={styles.slider}></span>
            </label>
            <span>Premium</span>
          </div>

        </div>
      </div>

      {/* MESS ADMINS / OWNER */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Mess Owner</h3>
        </div>

        <div className={styles.tabRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${ownerMode === "existing" ? styles.tabBtnActive : ""}`}
            onClick={() => setOwnerMode("existing")}
          >
            Select Existing Owner
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${ownerMode === "new" ? styles.tabBtnActive : ""}`}
            onClick={() => setOwnerMode("new")}
          >
            Create New Owner
          </button>
        </div>

        {ownerMode === "new" ? (
          <div className={styles.grid} style={{ marginTop: 18 }}>
            <div>
              <label>Owner Name *</label>
              <input
                name="name"
                placeholder="Owner full name"
                value={newOwner.name}
                onChange={handleNewOwnerChange}
              />
            </div>

            <div>
              <label>Owner Email *</label>
              <input
                type="email"
                name="email"
                placeholder="owner@example.com"
                value={newOwner.email}
                onChange={handleNewOwnerChange}
              />
            </div>

            <div>
              <label>Owner Phone *</label>
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                placeholder="9876543210"
                value={newOwner.phone}
                onChange={handleNewOwnerChange}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, "").slice(0, 10);
                }}
              />
            </div>

            <div>
              <label>Owner Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={newOwner.password}
                onChange={handleNewOwnerChange}
              />
            </div>
          </div>
        ) : (
          <>
            <div className={styles.cardHeader} style={{ marginTop: 18 }}>
              <span />
              <button
                type="button"
                className={styles.addSmallBtn}
                onClick={() => setShowAdminModal(true)}
              >
                <LuPlus /> Add Admin
              </button>
            </div>

            {selectedAdmins.length > 0 ? (
              <div className={styles.selectedAdminList}>
                {selectedAdmins.map((admin) => (
                  <div key={admin.id} className={styles.adminItem}>
                    <div>
                      <strong>{admin.name}</strong>
                      <p>{admin.email}</p>
                    </div>
                    <button
                      type="button"
                      className={styles.removeBtnSmall}
                      onClick={() => handleToggleAdmin(admin)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                No admins added yet. Click "Add Admin" to add one.
              </div>
            )}
          </>
        )}

        {showAdminModal && (
          <div
            className={styles.modalOverlay}
            onClick={handleAdminModalClose}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>Select Mess Admin</h3>
                <button
                  type="button"
                  className={styles.closeModalBtn}
                  onClick={handleAdminModalClose}
                >
                  ×
                </button>
              </div>

              {ownersLoading ? (
                <div>Loading admins...</div>
              ) : owners.length === 0 ? (
                <div>No mess owners found.</div>
              ) : (
                <div className={styles.adminList}>
                  {owners.map((owner) => (
                    <button
                      key={owner.id}
                      type="button"
                      className={`${styles.adminListItem} ${messAdminIds.includes(owner.id) ? styles.selectedAdminRow : ""}`}
                      onClick={() => handleToggleAdmin(owner)}
                    >
                      <div>
                        <strong>{owner.name}</strong>
                        <p>{owner.email}</p>
                      </div>
                      <span>
                        {messAdminIds.includes(owner.id) ? "Selected" : "Select"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.pagination}>
                <button
                  type="button"
                  disabled={ownerPage === 1}
                  onClick={() => setOwnerPage((p) => p - 1)}
                >
                  Prev
                </button>
                <span>
                  Page {ownerPage} of {ownerTotalPages}
                </span>
                <button
                  type="button"
                  disabled={ownerPage === ownerTotalPages}
                  onClick={() => setOwnerPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancel}
                  onClick={handleAdminModalClose}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOD TYPES */}
      <div className={styles.card}>
        <h3>Food Types</h3>

        <select
          onChange={(e) => {
            const value = e.target.value;
            if (!value || foodTypes.includes(value)) return;

            setFoodTypes((prev) => [...prev, value]);
          }}
        >
          <option value="">Select Food Type</option>
          {FOOD_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {type.replace("_", " ")}
            </option>
          ))}
        </select>

        <div className={styles.tagList}>
          {foodTypes.map((item, i) => (
            <div key={i} className={styles.tag}>
              <span>{item.replace(/_/g, " ")}</span>

              <button
                type="button"
                className={styles.tagClose}
                onClick={() =>
                  setFoodTypes((prev) =>
                    prev.filter((_, index) => index !== i)
                  )
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* TAGS */}
      <div className={styles.card}>
        <h3>Tags</h3>

        <select
          onChange={(e) => {
            const value = e.target.value;
            if (!value || tags.includes(value)) return;

            setTags((prev) => [...prev, value]);
          }}
        >
          <option value="">Select Tag</option>
          {TAG_OPTIONS.map((tag) => (
            <option key={tag} value={tag}>
              {tag.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <div className={styles.tagList}>
          {tags.map((item, i) => (
            <div key={i} className={styles.tag}>
              <span className={styles.tagText}>
                {item.replace(/_/g, " ")}
              </span>

              <button
                type="button"
                className={styles.tagClose}
                onClick={() =>
                  setTags((prev) =>
                    prev.filter((_, index) => index !== i)
                  )
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* COVER IMAGE */}
      <div className={styles.card}>
        <h3>Cover Image</h3>

        <label className={styles.uploadBox}>
          <p>Click to upload cover image</p>
          <span>PNG, JPG up to 5MB</span>

          <input
            type="file"
            accept="image/png, image/jpeg"
            hidden
            onChange={(e) => {
              if (!e.target.files?.[0]) return;

              const file = e.target.files[0];

              setCoverImage(file);
              setCoverPreview(URL.createObjectURL(file));
            }}
          />
        </label>

        {coverPreview && (
          <div className={styles.previewItem}>
            <img
              src={coverPreview}
              alt="cover"
              className={styles.previewImage}
            />

            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => {
                URL.revokeObjectURL(coverPreview);
                setCoverImage(null);
                setCoverPreview(null);
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* IMAGES */}
      <div className={styles.card}>
        <h3>Images</h3>

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

              // Create preview URLs
              const newPreviews = selectedFiles.map((file) =>
                URL.createObjectURL(file)
              );

              setFiles((prev) => [...prev, ...selectedFiles]);
              setPreviews((prev) => [...prev, ...newPreviews]);
            }}
          />
        </label>

        {previews.length > 0 && (
          <div className={styles.fileList}>
            {previews.map((src, i) => (
              <div key={i} className={styles.previewItem}>
                <img
                  src={src}
                  alt="preview"
                  className={styles.previewImage}
                />

                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => {
                    const updatedFiles = [...files];
                    const updatedPreviews = [...previews];

                    // Clean memory
                    URL.revokeObjectURL(updatedPreviews[i]);

                    updatedFiles.splice(i, 1);
                    updatedPreviews.splice(i, 1);

                    setFiles(updatedFiles);
                    setPreviews(updatedPreviews);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className={styles.actions}>
        <button
          className={styles.cancel}
          onClick={() => navigate("/messes")}
        >
          Cancel
        </button>

        <button
          className={styles.create}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Mess"}
        </button>
      </div>
    </div>
  );
}
