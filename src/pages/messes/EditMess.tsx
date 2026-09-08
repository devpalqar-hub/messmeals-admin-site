import styles from "./AddMess.module.css";
import { LuArrowLeft, LuPlus } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import api from "../../services/axios";
import { getMessOwners } from "../../services/messOwners.api";
import { useToast } from "../../components/ui/Toast/ToastContainer";
import {
  updateMess,
  updateMessImages,
  deleteMessImage,
  updateMessCoverImage,
  updateMessIcon,
  updateMessListing,
} from "../../services/editMess.api";

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

export default function EditMess() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

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

  // Public website listing (superadmin-only) — separate endpoint from the general update.
  const [listing, setListing] = useState({
    isListed: false,
    isFeatured: false,
  });

  const [loading, setLoading] = useState(true);

  // Arrays/tags/food types
  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // Mess owners/admins
  const [messAdminIds, setMessAdminIds] = useState<string[]>([]);
  const [selectedAdmins, setSelectedAdmins] = useState<MessOwner[]>([]);
  const [owners, setOwners] = useState<MessOwner[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [ownerPage, setOwnerPage] = useState(1);
  const [ownerLimit] = useState(5);
  const [ownerTotalPages, setOwnerTotalPages] = useState(1);
  const [ownersLoading, setOwnersLoading] = useState(false);

  // Icon / logo
  const [existingIcon, setExistingIcon] = useState<string | null>(null);
  const [iconImage, setIconImage] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  // Cover image
  const [existingCover, setExistingCover] = useState<{ id: string; url: string } | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Gallery images
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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

  const formatLabel = (value: string) =>
    value
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  // Fetch mess details
  useEffect(() => {
    const fetchMess = async () => {
      try {
        if (!id) return;
        const res = await api.get(`/mess/${id}`);
        const data = res.data;

        setForm({
          name: data.name || "",
          description: data.description || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          location: data.location || "",
          latitude: data.latitude || "",
          longitude: data.logitude || "",
          is_active: data.is_active ?? false,
          is_verified: data.is_verified ?? false,
          isPremium: data.isPremium ?? false,
        });

        setListing({
          isListed: data.isListed ?? false,
          isFeatured: data.isFeatured ?? false,
        });

        setExistingIcon(data.icon || null);

        setFoodTypes(data.foodTypes?.map((item: any) => item.foodType) || []);
        setTags(data.tags?.map((item: any) => item.tag) || []);

        if (data.images && data.images.length > 0) {
          const cover = data.images.find((img: any) => img.isCover);
          const gallery = data.images.filter((img: any) => !img.isCover);

          if (cover) {
            setExistingCover({
              id: cover.id,
              url: cover.url,
            });
          }

          setExistingImages(
            gallery.map((img: any) => ({
              id: img.id,
              url: img.url,
            }))
          );
        }

        if (data.messAdmins && data.messAdmins.length > 0) {
          const adminIds = data.messAdmins.map((admin: any) => admin.id);
          const admins = data.messAdmins.map((admin: any) => ({
            id: admin.user?.id || admin.id,
            name: admin.user?.name || "",
            email: admin.user?.email || "",
            phone: admin.user?.phone || "",
            messAdminProfile: {
              id: admin.id,
            },
          }));
          setMessAdminIds(adminIds);
          setSelectedAdmins(admins);
        }
      } catch (error) {
        console.error("Failed to load mess", error);
        showToast("Failed to load mess details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMess();
  }, [id, showToast]);

  // Fetch owners (admins) modal pagination
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

  const handleListingChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setListing((prev) => ({ ...prev, [name]: checked }));
  };

  const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setIconImage(file);
    setIconPreview(URL.createObjectURL(file));
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
      setSelectedAdmins((prev) => prev.filter((item) => item.messAdminProfile?.id !== profileId));
      return;
    }

    setMessAdminIds((prev) => [...prev, profileId]);
    setSelectedAdmins((prev) => [...prev, owner]);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter(
      (file) => file.size <= 5 * 1024 * 1024
    );

    const newPreviews = validFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    const updatedFiles = [...files];
    const updatedPreviews = [...previews];

    URL.revokeObjectURL(updatedPreviews[index]);

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
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

  const handleUpdate = async () => {
    try {
      if (!id) return;

      if (existingImages.length === 0 && files.length === 0) {
        showToast("At least one image is required", "error");
        return;
      }

      setLoading(true);

      const payload = {
        name: form.name,
        description: form.description,
        address: form.address,
        phone: form.phone,
        email: form.email,
        is_active: form.is_active,
        is_verified: form.is_verified,
        isPremium: form.isPremium,
        location: form.location,
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
        foodTypes,
        tags,
        features: [],
      };

      // 1️⃣ Delete removed images from backend
      if (deletedImageIds.length > 0) {
        await Promise.all(
          deletedImageIds.map((imageId) =>
            deleteMessImage(id, imageId)
          )
        );
      }

      // 2️⃣ Upload new gallery images to backend
      if (files.length > 0) {
        await updateMessImages(id, files);
      }

      // 3️⃣ Upload cover image to backend
      if (coverImage) {
        console.log("Uploading new cover image...", id, coverImage);
        await updateMessCoverImage(id, coverImage);
      }

      // 3️⃣b Upload icon/logo to backend
      if (iconImage) {
        await updateMessIcon(id, iconImage);
      }

      // 4️⃣ Update mess details LAST
      await updateMess(id, payload);

      // 5️⃣ Superadmin-only public listing settings (separate endpoint)
      await updateMessListing(id, listing);

      showToast("Mess updated successfully", "success");
      navigate("/messes");
    } catch (error: unknown) {
      console.error("Update failed", error);
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div className={styles.wrapper}>
      {/* Back */}
      <div className={styles.back} onClick={() => navigate(-1)}>
        <LuArrowLeft /> Back to Messes
      </div>

      {/* BASIC INFO */}
      <div className={styles.card}>
        <h3>Edit Mess</h3>

        <div className={styles.grid}>
          <div>
            <label>Mess Name *</label>
            <input
              name="name"
              placeholder="Enter mess name"
              value={form.name}
              onChange={handleChange}
            />
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
              placeholder="mess@email.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Location</label>
            <input
              name="location"
              placeholder="City, State"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Address</label>
            <input
              name="address"
              placeholder="Full address"
              value={form.address}
              onChange={handleChange}
            />
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
          <textarea
            name="description"
            placeholder="Describe the mess..."
            value={form.description}
            onChange={handleChange}
          />
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

      {/* PUBLIC LISTING (superadmin-only) */}
      <div className={styles.card}>
        <h3>Public Listing</h3>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 12px" }}>
          Controls whether this mess appears on the public website (open/messes API).
        </p>

        <div className={styles.switchGroup}>
          <div className={styles.switchItem}>
            <label className={styles.switch}>
              <input
                type="checkbox"
                name="isListed"
                checked={listing.isListed}
                onChange={handleListingChange}
              />
              <span className={styles.slider}></span>
            </label>
            <span>List on Website</span>
          </div>

          <div className={styles.switchItem}>
            <label className={styles.switch}>
              <input
                type="checkbox"
                name="isFeatured"
                checked={listing.isFeatured}
                onChange={handleListingChange}
              />
              <span className={styles.slider}></span>
            </label>
            <span>Featured</span>
          </div>
        </div>
      </div>

      {/* MESS ADMINS */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Mess Admins</h3>

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
                      className={`${styles.adminListItem} ${messAdminIds.includes(owner.messAdminProfile?.id || "") ? styles.selectedAdminRow : ""}`}
                      onClick={() => handleToggleAdmin(owner)}
                    >
                      <div>
                        <strong>{owner.name}</strong>
                        <p>{owner.email}</p>
                      </div>
                      <span>
                        {messAdminIds.includes(owner.messAdminProfile?.id || "") ? "Selected" : "Select"}
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
          value=""
        >
          <option value="">Select Food Type</option>
          {FOOD_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {formatLabel(type)}
            </option>
          ))}
        </select>

        <div className={styles.tagList}>
          {foodTypes.map((item, i) => (
            <div key={i} className={styles.tag}>
              <span>{formatLabel(item)}</span>

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
          value=""
        >
          <option value="">Select Tag</option>
          {TAG_OPTIONS.map((tag) => (
            <option key={tag} value={tag}>
              {formatLabel(tag)}
            </option>
          ))}
        </select>

        <div className={styles.tagList}>
          {tags.map((item, i) => (
            <div key={i} className={styles.tag}>
              <span>{formatLabel(item)}</span>

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

      {/* ICON / LOGO */}
      <div className={styles.card}>
        <h3>Icon / Logo</h3>

        {!existingIcon && !iconPreview ? (
          <label className={styles.uploadBox}>
            <p>Click to upload icon/logo</p>
            <span>PNG, JPG up to 5MB</span>

            <input
              type="file"
              accept="image/png, image/jpeg"
              hidden
              onChange={handleIconChange}
            />
          </label>
        ) : (
          <div className={styles.previewGrid}>
            {existingIcon && !iconPreview && (
              <div className={styles.previewItem}>
                <img
                  src={existingIcon}
                  alt="icon"
                  className={styles.previewImage}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => setExistingIcon(null)}
                >
                  ×
                </button>
              </div>
            )}

            {iconPreview && (
              <div className={styles.previewItem}>
                <img
                  src={iconPreview}
                  alt="new icon"
                  className={styles.previewImage}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => {
                    URL.revokeObjectURL(iconPreview);
                    setIconImage(null);
                    setIconPreview(null);
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* COVER IMAGE */}
      <div className={styles.card}>
        <h3>Cover Image</h3>

        {!existingCover && !coverPreview ? (
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
        ) : (
          <div className={styles.previewGrid}>
            {/* Existing Cover */}
            {existingCover && !coverPreview && (
              <div className={styles.previewItem}>
                <img
                  src={existingCover.url}
                  alt="cover"
                  className={styles.previewImage}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => {
                    setExistingCover(null);
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* New Cover Preview */}
            {coverPreview && (
              <div className={styles.previewItem}>
                <img
                  src={coverPreview}
                  alt="new cover"
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
            onChange={handleImageChange}
          />
        </label>

        {(existingImages.length > 0 || previews.length > 0) && (
          <div className={styles.previewGrid}>
            {/* Existing Images */}
            {existingImages.map((img, index) => (
              <div key={`existing-${index}`} className={styles.previewItem}>
                <img
                  src={img.url}
                  alt="existing"
                  className={styles.previewImage}
                />

                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => {
                    setDeletedImageIds((prev) => [...prev, img.id]);
                    setExistingImages((prev) =>
                      prev.filter((_, i) => i !== index)
                    );
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            {/* Newly Selected Images */}
            {previews.map((src, index) => (
              <div key={`new-${index}`} className={styles.previewItem}>
                <img
                  src={src}
                  alt="preview"
                  className={styles.previewImage}
                />

                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeNewImage(index)}
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

        <button className={styles.create} onClick={handleUpdate}>
          Update Mess
        </button>
      </div>
    </div>
  );
}
