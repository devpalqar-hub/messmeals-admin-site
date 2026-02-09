import styles from "./EditMess.module.css";
import { LuArrowLeft } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { updateMess } from "../../api/editMess.api";
import { useToast } from "../../components/ui/Toast/ToastContainer";


export default function EditMess() {
  const navigate = useNavigate();
  const { id } = useParams();

const { showToast } = useToast();


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

  /* ---------------- ARRAYS ---------------- */

  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  /* ---------------- FETCH MESS DATA ---------------- */

useEffect(() => {
  const fetchMess = async () => {
    try {
      if (!id) return;

      const res = await api.get(`/mess/${id}`);
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
      // 🔥 Fetch existing images
        if (data.images && data.images.length > 0) {
        const imageUrls = data.images.map((img: any) =>
            `https://your-api.com/uploads/${img.image}`
        );

        setExistingImages(imageUrls);
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

  const handleUpdate = async () => {
    try {
      if (!id) return;

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

      await updateMess(id, payload);
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
                    src={img}
                    alt="existing"
                    className={styles.previewImage}
                  />

                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() =>
                      setExistingImages((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
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
