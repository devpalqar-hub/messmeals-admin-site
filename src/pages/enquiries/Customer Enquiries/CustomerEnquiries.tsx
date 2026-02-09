import { useEffect,useState } from "react";
import styles from "./CustomerEnquiries.module.css";
import { LuMail} from "react-icons/lu";
import { getEnquiries, type Enquiry } from "../../../api/enquiry.api";


export default function CustomerEnquiries() {
 const [page, setPage] = useState(1);
  const limit = 5;
  const [data, setData] = useState<Enquiry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchEnquiries();
  }, [page]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await getEnquiries("user", page, limit);
      setData(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      console.error("Failed to load customer enquiries");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableBox}>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Mess</th>
              <th>Location</th>
              <th>Question</th>
              <th>Date</th>
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
            {!loading && data.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>

                <td className={styles.contact}>
                  <LuMail /> {e.email}
                </td>

                <td>{e.mess?.name ?? "-"}</td>
                <td>{e.district ?? "-"}</td>


                <td className={styles.message}>
                  {e.message.length > 30
                    ? e.message.slice(0, 30) + "..."
                    : e.message}
                </td>

                <td>
                  {new Date(e.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className={styles.pagination}>
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
