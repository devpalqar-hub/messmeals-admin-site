import styles from "./AddMess.module.css";
import { LuArrowLeft, LuPlus } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createMess } from "../../api/addMess.api";
import {  useEffect } from "react";
import api from "../../api/axios"; 
import { useToast } from "../../components/ui/Toast/ToastContainer";

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
    districtId: "",
    is_active: true,
    is_verified: false,
    is_premium: false, 
  });

  const { showToast } = useToast();

  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [messAdminIds] = useState<string[]>([]); // later dynamic
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


  type Day =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const [selectedDay, setSelectedDay] = useState<Day>("monday");
const [openTime, setOpenTime] = useState("08:00");
const [closeTime, setCloseTime] = useState("20:00");

const [openingHours, setOpeningHours] = useState<
  Record<Day, string>
>({
  monday: "closed",
  tuesday: "closed",
  wednesday: "closed",
  thursday: "closed",
  friday: "closed",
  saturday: "closed",
  sunday: "closed",
});
  interface District {
  id: string;
  name: string;
}

const [districts, setDistricts] = useState<District[]>([]);
const [loadingDistricts, setLoadingDistricts] = useState(false);
  useEffect(() => {
  const fetchDistricts = async () => {
    try {
      setLoadingDistricts(true);

      const res = await api.get("/districts");
       console.log("DISTRICT RESPONSE:", res.data);
      if (res.data?.data) {
        setDistricts(res.data.data);
      }

    } catch (error) {
      console.error("Failed to fetch districts", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  fetchDistricts();
}, []);

   useEffect(() => {
  console.log("DISTRICTS STATE:", districts);
}, [districts]);



  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleAddHours = () => {

  setOpeningHours((prev) => ({
    ...prev,
    [selectedDay]: `${openTime}-${closeTime}`,
  }));
};

   
  const handleSubmit = async () => {
     console.log("FILES STATE:", files);
    try {
      setLoading(true);
       console.log(createMess)
      await createMess({
        ...form,
        openingHours,
        messAdminIds,
        foodTypes,
        tags,
        files,
      });
    showToast("Mess created successfully ", "success");

        navigate("/messes");
        } catch (error: any) {
    console.error("Create mess failed", error);

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
            <input name="name"  placeholder="Enter mess name" onChange={handleChange} />
          </div>

          <div>
            <label>Phone *</label>
            <input name="phone"  placeholder="+91 98765 43210" onChange={handleChange} />
          </div>

          <input
            type="email"
            name="email"
            value={form.email}
            placeholder="mess@email.com"
            onChange={handleChange}
            />


          <div>
            <label>Location</label>
            <input name="location" placeholder="City, State" onChange={handleChange} />
          </div>

          <div>
            <label>Address</label>
            <input name="address" placeholder="Full address" onChange={handleChange} />
          </div>

          <div>
            <label>District *</label>
            <select
                name="districtId"
                value={form.districtId}
                onChange={handleChange}
                required
            >
                <option value="">
                {loadingDistricts ? "Loading districts..." : "Select District"}
                </option>

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
          <textarea name="description"  placeholder="Describe the mess..." onChange={handleChange} />
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
                name="is_premium"
                checked={form.is_premium}
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
                <LuPlus /> Add Hours
                </button>
            </div>

            <div className={styles.hoursRow}>
                <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value as Day)}
                >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
                </select>

                <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                />

                <span>to</span>

                <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                />
            </div>
            </div>
            {/* MESS ADMINS */}
            <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h3>Mess Admins</h3>

                <button type="button" className={styles.addSmallBtn}>
                <LuPlus /> Add Hours
                </button>
            </div>

            <div className={styles.emptyState}>
                No admins added yet. Click "Add Admin" to add one.
            </div>
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
