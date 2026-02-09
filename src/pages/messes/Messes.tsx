import { useEffect, useState } from "react";
import styles from "./Messes.module.css";
import {  LuEye, LuPlus, LuSearch,LuPencil } from "react-icons/lu";
import { getMesses, type Mess } from "../../api/mess.api";
import { useNavigate } from "react-router-dom";
import { updateMessStatus } from "../../api/mess.api";

export default function Messes() {
  const navigate = useNavigate();


  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 7;

  const [messes, setMesses] = useState<Mess[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMesses();
  }, [page]);

  const fetchMesses = async () => {
    try {
      setLoading(true);
      const res = await getMesses(page, limit);
      setMesses(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      console.error("Failed to load messes");
    } finally {
      setLoading(false);
    }
  };



const handleToggle = async (id: string, currentStatus: boolean) => {
  try {
    const newStatus = !currentStatus;

    // 🔥 Optimistic update (instant UI change)
    setMesses((prev: any[]) =>
      prev.map((mess) =>
        mess.id === id ? { ...mess, is_active: newStatus } : mess
      )
    );

    await updateMessStatus(id, newStatus);

  } catch (error) {
    console.error("Failed to update status", error);
  }
};


  // frontend search
  const filtered = messes.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className={styles.wrapper}>

      {/* SEARCH BAR */}
      <div className={styles.topBar}>
        <div className={styles.searchBox}>
          <LuSearch />
          <input
            placeholder="Search messes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={styles.addButton}
          onClick={() => navigate("/messes/add")}
        >
          <LuPlus /> Add New Mess
        </button>
      </div>

      {/* TABLE */}
      <div className={styles.tableBox}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Location</th>
              <th>Premium</th>
              <th>Active</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && filtered.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td className={styles.phone}>{m.phone}</td>
                <td>{m.email}</td>
                <td>{m.location}</td>
                <td>
                  {m.isPremium ? (
                    <span className={styles.premium}>Premium</span>
                  ) : (
                    <span className={styles.normal}>Normal</span>
                  )}
                </td>
                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={m.is_active}
                      onChange={() => handleToggle(m.id, m.is_active)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>

                <td>{m.createdAt}</td>
                <td>
                  <div className={styles.actions}>
                    <LuEye className={styles.actionsIcon} onClick={() => navigate(`/messes/${m.id}`)} />
                    <LuPencil className={styles.actionsIcon} onClick={() => navigate(`/messes/edit/${m.id}`)}/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className={styles.pagination}>
        <div>
          Page {page} of {totalPages}
        </div>
        <div className={styles.paginationbuttons}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p)=> p - 1)}
          >
            Prev
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p)=> p + 1)}
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
