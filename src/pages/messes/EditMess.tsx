import styles from "./EditMess.module.css";
import { LuArrowLeft } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { updateMess } from "../../api/editMess.api";
import { useToast } from "../../components/ui/Toast/ToastContainer";
import { updateMessImages, deleteMessImage } from "../../api/editMess.api";
import { updateMessCoverImage,updatePlan } from "../../api/editMess.api";


export default function EditMess() {
  const navigate = useNavigate();
  const { id } = useParams();

const { showToast } = useToast();

const [existingCover, setExistingCover] = useState<{ id: string; url: string } | null>(null);
const [coverImage, setCoverImage] = useState<File | null>(null);
const [coverPreview, setCoverPreview] = useState<string | null>(null);




  /* ---------------- FORM STATE ---------------- */

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    location: "",
    districtId: "",
    is_active: true,
    is_verified: false,
    isPremium: false,
  });
const FOOD_TYPE_OPTIONS = [
  "VEG",
  "NON_VEG",
  "MIXED",
];

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
];
const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  /* ---------------- OPENING HOURS ---------------- */

  const [openingHours, setOpeningHours] = useState<Record<string, string>>({
    monday: "closed",
    tuesday: "closed",
    wednesday: "closed",
    thursday: "closed",
    friday: "closed",
    saturday: "closed",
    sunday: "closed",
  });

  const [selectedDay, setSelectedDay] = useState("monday");
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("20:00");

  const handleAddHours = () => {
    setOpeningHours((prev) => ({
      ...prev,
      [selectedDay]: `${openTime}-${closeTime}`,
    }));
  };
 const [loading, setLoading] = useState(true);



   /* ---------------- PLANS ---------------- */
   interface EditPlan {
  id: string;
  planName: string;
  price: number;
  minPrice: number;
  description: string;
  isMonthlyPlan: boolean;
  isDailyPlan: boolean;
  variationIds: string[];
  // 🔥 ADD THIS
  images: {
    id: string;
    url: string;
  }[];
}
interface Variation {
  id: string;
  title: string;
  isActive: boolean;
}

const [variationList, setVariationList] = useState<Variation[]>([]);

const [plans, setPlans] = useState<EditPlan[]>([]);
const [originalPlans, setOriginalPlans] = useState<EditPlan[]>([]);


const handlePlanChange = (
  index: number,
  field: keyof EditPlan,
  value: any
) => {
  setPlans((prev) => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    return updated;
  });
};

useEffect(() => {
  const fetchVariations = async () => {
    try {
      const res = await api.get("/variation/");
      setVariationList(res.data);
    } catch (error) {
      console.error("Failed to fetch variations", error);
    }
  };

  fetchVariations();
}, []);
const handlePlanVariationChange = (
  planIndex: number,
  variationId: string
) => {
  setPlans((prev) => {
    const updated = [...prev];

    const currentIds = updated[planIndex].variationIds || [];

    updated[planIndex] = {
      ...updated[planIndex],
      variationIds: currentIds.includes(variationId)
        ? currentIds.filter((id) => id !== variationId)
        : [...currentIds, variationId],
    };

    return updated;
  });
};

  /* ---------------- ARRAYS ---------------- */

  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  /* ---------------- FETCH MESS DATA ---------------- */

useEffect(() => {
  const fetchMess = async () => {
    try {
      if (!id) return;

      const res = await api.get(`/mess/${id}`);
      console.log("MESS DATA:", res.data);
      const data = res.data;

      // 🔥 Set form
      setForm({
        name: data.name || "",
        description: data.description || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        location: data.location || "",
        districtId: data.districtId || "",
        is_active: data.is_active ?? false,
        is_verified: data.is_verified ?? false,
        isPremium: data.isPremium ?? false,
      });

      // 🔥 Extract foodType strings
      setFoodTypes(
        data.foodTypes?.map((item: any) => item.foodType) || []
      );

      // 🔥 Extract tag strings
      setTags(
        data.tags?.map((item: any) => item.tag) || []
      );

      // 🔥 Opening hours
      setOpeningHours({
        monday: "closed",
        tuesday: "closed",
        wednesday: "closed",
        thursday: "closed",
        friday: "closed",
        saturday: "closed",
        sunday: "closed",
        ...(data.openingHours || {}),
      });

      if (data.plans && data.plans.length > 0) {
      const formattedPlans = data.plans.map((plan: any) => ({
        id: plan.id,
        planName: plan.planName,
        price: Number(plan.price),
        minPrice: Number(plan.minPrice),
        description: plan.description,
        isMonthlyPlan: plan.isMonthlyPlan,
        isDailyPlan: plan.isDailyPlan,
        variationIds: plan.Variation?.map((v: any) => v.id) || [],
        // 🔥 ADD THIS
          images: plan.images?.map((img: any) => ({
            id: img.id,
            url: img.url,
          })) || [],
        }));
      setPlans(formattedPlans);
      setOriginalPlans(formattedPlans);
    }

      // 🔥 Fetch existing images
        // 🔥 Fetch existing images (CORRECT VERSION)
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

    } catch (error) {
      console.error("Failed to load mess", error);
    } finally {
      setLoading(false);
    }
  };

  fetchMess();
}, [id]);

const [images, setImages] = useState<File[]>([]);
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;

  const selectedFiles = Array.from(e.target.files);

  // Limit size 5MB per image
  const validFiles = selectedFiles.filter(
    (file) => file.size <= 5 * 1024 * 1024
  );

  setImages((prev) => [...prev, ...validFiles]);
};
const removeImage = (index: number) => {
  setImages((prev) => prev.filter((_, i) => i !== index));
};






  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //plans portions

  /* 🔥 ADD HERE */
const isPlanChanged = (plan: EditPlan, original: EditPlan) => {
  return (
    plan.planName !== original.planName ||
    plan.price !== original.price ||
    plan.minPrice !== original.minPrice ||
    plan.description !== original.description ||
    plan.isMonthlyPlan !== original.isMonthlyPlan ||
    plan.isDailyPlan !== original.isDailyPlan ||
    JSON.stringify([...plan.variationIds].sort()) !==
      JSON.stringify([...original.variationIds].sort())
  );
};

  const handleUpdate = async () => {
  try {
    if (!id) return;

    if (existingImages.length === 0 && images.length === 0) {
      showToast("At least one image is required", "error");
      return;
    }

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
      districtId: form.districtId,
      openingHours,
      foodTypes,
      tags,
      features: [],
    };

    // 1️⃣ Delete removed images
    if (deletedImageIds.length > 0) {
      await Promise.all(
        deletedImageIds.map((imageId) =>
          deleteMessImage(id, imageId)
        )
      );
    }

    // 2️⃣ Upload new gallery images
    if (images.length > 0) {
      await updateMessImages(id, images);
    }

    // 3️⃣ Upload cover image (🔥 THIS WAS MISSING PROPER POSITION)
    if (coverImage) {
      console.log("Uploading new cover image...", id, coverImage);
      await updateMessCoverImage(id, coverImage);
    }

    // 4️⃣ Update mess details LAST
    await updateMess(id, payload);
    // 5️⃣ Update each plan
    // 5️⃣ Update only edited plans
    for (let i = 0; i < plans.length; i++) {
      const current = plans[i];
      const original = originalPlans[i];

      if (!original) continue;

      if (isPlanChanged(current, original)) {
        await updatePlan(current.id, {
          planName: current.planName,
          price: current.price,
          minPrice: current.minPrice,
          description: current.description,
          variationIds: current.variationIds,
          isMonthlyPlan: current.isMonthlyPlan,
          isDailyPlan: current.isDailyPlan,
        });
      }
    }



    showToast("Mess updated successfully", "success");
    navigate("/messes");

  } catch (error: any) {
    console.error("Update failed", error);

    let errorMessage = "Something went wrong";

    if (error.response?.data?.message) {
      if (Array.isArray(error.response.data.message)) {
        errorMessage = error.response.data.message.join(", ");
      } else {
        errorMessage = error.response.data.message;
      }
    }

    showToast(errorMessage, "error");
  }
};



    const [districts, setDistricts] = useState<
    { id: string; name: string }[]
  >([]);


useEffect(() => {

  const fetchDistricts = async () => {
    try {
      const res = await api.get("/districts");
      const data = res.data.data;   // because your API wraps in data

      setDistricts(data);
    } catch (error) {
      console.error("Failed to fetch districts", error);
    }
  };

  fetchDistricts();
}, []);
 


  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  /* ---------------- UI ---------------- */

  return (
    <div className={styles.wrapper}>
      <div className={styles.back} onClick={() => navigate(-1)}>
        <LuArrowLeft /> Back to Messes
      </div>

      {/* BASIC INFO */}
      <div className={styles.card}>
        <h3>Edit Mess</h3>

        <div className={styles.grid}>
    
          <div>
            <label>Mess Name *</label>
            <input name="name" value={form.name} onChange={handleChange} />
          </div>

          <div>
            <label>Phone *</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>

          <div>
            <label>Email *</label>
            <input name="email" value={form.email} onChange={handleChange} />
          </div>

          <div>
            <label>Location</label>
            <input name="location" value={form.location} onChange={handleChange} />
          </div>

          <div>
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} />
          </div>

          <div>
            <label>District *</label>

            <select
                name="districtId"
                value={form.districtId}
                onChange={handleChange}
            >
                <option value="">Select District</option>

                {districts.map((district) => (
                <option key={district.id} value={district.id}>
                    {district.name}
                </option>
                ))}
            </select>
            </div>
        </div>

        <div className={styles.fullWidth}>
          <label>Description</label>
          <textarea
            name="description"
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

      {/* OPENING HOURS */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Opening Hours</h3>
          <button
            type="button"
            className={styles.addSmallBtn}
            onClick={handleAddHours}
          >
            + Add Hours
          </button>
        </div>

        <div className={styles.hoursRow}>
          <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>

          <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
          <span>to</span>
          <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
        </div>
      </div>

      {/* FOOD TYPES */}
          <div className={styles.card}>
            <h3>Food Types</h3>

            <select
              value=""
              onChange={(e) => {
                const value = e.target.value;
                if (!value || foodTypes.includes(value)) return;
                setFoodTypes((prev) => [...prev, value]);
              }}
            >
              <option value="">Select Food Type</option>
              {FOOD_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {formatLabel(type)}
                </option>
              ))}
            </select>

            <div className={styles.tagList}>
              {foodTypes.length === 0 ? (
                <p className={styles.emptyText}>No food types selected</p>
              ) : (
                foodTypes.map((item) => (
                  <div key={item} className={styles.tag}>
                    <span>{formatLabel(item)}</span>

                    <button
                      type="button"
                      className={styles.tagClose}
                      onClick={() =>
                        setFoodTypes((prev) =>
                          prev.filter((type) => type !== item)
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

      {/* TAGS */}
            <div className={styles.card}>
              <h3>Tags</h3>

              <select
                value=""
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value || tags.includes(value)) return;
                  setTags((prev) => [...prev, value]);
                }}
              >
                <option value="">Select Tag</option>
                {TAG_OPTIONS.map((tag) => (
                  <option key={tag} value={tag}>
                    {formatLabel(tag)}
                  </option>
                ))}
              </select>

              <div className={styles.tagList}>
                {tags.length === 0 ? (
                  <p className={styles.emptyText}>No tags selected</p>
                ) : (
                  tags.map((item) => (
                    <div key={item} className={styles.tag}>
                      <span>{formatLabel(item)}</span>

                      <button
                        type="button"
                        className={styles.tagClose}
                        onClick={() =>
                          setTags((prev) =>
                            prev.filter((tag) => tag !== item)
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* COVER IMAGE */}
{/* COVER IMAGE */}
<div className={styles.card}>
  <h3>Cover Image</h3>

  <div className={styles.previewGrid}>

    {/* Existing Cover */}
    {existingCover && !coverPreview && (
      <div className={styles.previewItem}>
        <img
          src={existingCover.url}
          alt="cover"
          className={styles.previewImage}
        />
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

  <input
    type="file"
    accept="image/png, image/jpeg"
    onChange={(e) => {
      if (!e.target.files?.[0]) return;

      const file = e.target.files[0];
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }}
  />
</div>

            {/* IMAGES */}
            <div className={styles.card}>
              <h3>Images</h3>

              <div className={styles.uploadBox}>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                  className={styles.hiddenInput}
                  id="imageUpload"
                />

                <label htmlFor="imageUpload" className={styles.uploadLabel}>
                  <div className={styles.uploadContent}>
                    <p>Drag & drop images here or click to upload</p>
                    <span>PNG, JPG up to 5MB</span>
                  </div>
                </label>
              </div>

              {/* Preview */}
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
                        setDeletedImageIds((prev) => [
                          ...prev,
                          existingImages[index].id,
                        ]);

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
                {images.map((file, index) => (
                  <div key={`new-${index}`} className={styles.previewItem}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className={styles.previewImage}
                    />

                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

          {/* PLANS SECTION */}
{plans.length > 0 && (
  <div className={styles.card}>
    <h3>Plans</h3>

    {plans.map((plan, index) => (
      <div key={plan.id} style={{ marginBottom: 30 }}>

        <div className={styles.grid}>
          <div>
            <label>Plan Name</label>
            <input
              value={plan.planName}
              onChange={(e) =>
                handlePlanChange(index, "planName", e.target.value)
              }
            />
          </div>

          <div>
            <label>Price</label>
            <input
              type="number"
              value={plan.price}
              onChange={(e) =>
                handlePlanChange(index, "price", Number(e.target.value))
              }
            />
          </div>

          <div>
            <label>Min Price</label>
            <input
              type="number"
              value={plan.minPrice}
              onChange={(e) =>
                handlePlanChange(index, "minPrice", Number(e.target.value))
              }
            />
          </div>
        </div>

        <div style={{ marginTop: 15 }}>
          <label>Description</label>
          <textarea
            value={plan.description}
            onChange={(e) =>
              handlePlanChange(index, "description", e.target.value)
            }
          />
        </div>

        <div style={{ marginTop: 15, display: "flex", gap: 20 }}>
          <label>
            <input
              type="checkbox"
              checked={plan.isMonthlyPlan}
              onChange={(e) =>
                handlePlanChange(index, "isMonthlyPlan", e.target.checked)
              }
            />
            Monthly Plan
          </label>

          <label>
            <input
              type="checkbox"
              checked={plan.isDailyPlan}
              onChange={(e) =>
                handlePlanChange(index, "isDailyPlan", e.target.checked)
              }
            />
            Daily Plan
          </label>
        </div>
        
        {/* 🔥 MOVE VARIATION HERE */}
        <div className={styles.variationSection}>
          <label className={styles.variationTitle}>
            Variations
          </label>

          <div className={styles.variationGrid}>
            {variationList
              .filter((v) => v.isActive)
              .map((variation) => (
                <label
                  key={variation.id}
                  className={`${styles.variationItem} ${
                    plan.variationIds?.includes(variation.id)
                      ? styles.variationSelected
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={plan.variationIds?.includes(
                      variation.id
                    )}
                    onChange={() =>
                      handlePlanVariationChange(
                        index,
                        variation.id
                      )
                    }
                  />
                  {variation.title}
                </label>
              ))}
          </div>
        </div>
        {/* PLAN IMAGES */}
        {plan.images && plan.images.length > 0 && (
          <div className={styles.planImageSection}>
            <div className={styles.planImageTitle}>
              Plan Images
            </div>

            <div className={styles.planPreviewGrid}>
              {plan.images.map((img) => (
                <div key={img.id} className={styles.planPreviewItem}>
                  <img
                    src={img.url}
                    alt="plan"
                    className={styles.planPreviewImage}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
)}


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
