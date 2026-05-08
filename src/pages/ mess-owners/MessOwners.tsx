import { useEffect, useState } from "react";
import styles from "./MessOwners.module.css";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { LuSearch } from "react-icons/lu";
import { getMessOwners } from "../../services/messOwners.api";

interface Mess {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

interface MessOwner {
  id: string;
  name: string;
  phone: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  createdAt: string;
  messAdminProfile?: {
    messes: Mess[];
    
  };
}

const MessOwners = () => {
  const [owners, setOwners] = useState<MessOwner[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  
useEffect(() => {
  const delayDebounce = setTimeout(() => {
    fetchOwners();
  }, 400);

  return () => clearTimeout(delayDebounce);
}, [page, search]);

const fetchOwners = async () => {
  try {
    setLoading(true);

    const res = await getMessOwners(
      page,
      limit,
      search
    );

    setOwners(res.data.data);
    setTotalPages(res.data.meta.totalPages);
  } catch (error) {
    console.error("Failed to fetch mess owners", error);
  } finally {
    setLoading(false);
  }
};
  

  return (
    <div className={styles.wrapper}>
     
      <div className={styles.topBar}>
        <div className={styles.searchBox}>
          <LuSearch />
          <input
            placeholder="Search mess owners..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <button
          className={styles.addButton}
          onClick={() => navigate("/mess-owners/add")}
        >
          <FiPlus />
          Add New Mess Owner
        </button>
      </div>

      <div className={styles.tableBox}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Verified</th>
              <th>Status</th>
              <th>Messes</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
          {loading && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          )}

          {!loading && owners.length > 0 ? (
            owners.map((owner) => (
              <tr key={owner.id}>
                <td>{owner.name}</td>
                <td>{owner.email}</td>
                <td>{owner.phone}</td>

                <td>
                  {owner.is_verified ? (
                    <span className={styles.active}>
                      Verified
                    </span>
                  ) : (
                    <span className={styles.inactive}>
                      Not Verified
                    </span>
                  )}
                </td>

                <td>
                  <span
                    className={
                      owner.is_active
                        ? styles.active
                        : styles.inactive
                    }
                  >
                    {owner.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td>
                  {owner.messAdminProfile?.messes?.length
                    ? owner.messAdminProfile.messes
                        .map((m) => m.name)
                        .join(", ")
                    : "No mess assigned"}
                </td>

                <td>
                  {new Date(owner.createdAt).toLocaleDateString(
                    "en-IN"
                  )}
                </td>
              </tr>
            ))
          ) : (
            !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  No Mess Owners Found
                </td>
              </tr>
            )
          )}
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
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessOwners;
