import { useState } from "react";
import styles from "./MessEnquiries.module.css";
import { LuEllipsisVertical, LuMail } from "react-icons/lu";

const dummyEnquiries = [
  {
    id: 1,
    name: "Devan",
    email: "newfood@gmail.com",
    messName: "newfoodmess",
    location: "Kollam - 690542",
    message: "hi",
    date: "04 Feb 2026",
  },
  {
    id: 2,
    name: "Adam",
    email: "adamfood@gmail.com",
    messName: "englishbreakfast",
    location: "Alappuzha - 567880",
    message: "hi there",
    date: "04 Feb 2026",
  },
  {
    id: 3,
    name: "Adheena",
    email: "keralafood@gmail.com",
    messName: "kerala food store",
    location: "Idukki - 679823",
    message: "hi",
    date: "04 Feb 2026",
  },
  {
    id: 4,
    name: "Rahul",
    email: "rahul@gmail.com",
    messName: "suvarnaa",
    location: "Alappuzha - 690542",
    message: "Do you provide monthly veg meals?",
    date: "04 Feb 2026",
  },
];

export default function MessEnquiries() {
  const [page, setPage] = useState(1);
  const limit = 4;

  const totalPages = Math.ceil(dummyEnquiries.length / limit);
  const start = (page - 1) * limit;
  const visible = dummyEnquiries.slice(start, start + limit);

  return (
    <div className={styles.wrapper}>

      <div className={styles.tableBox}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Mess Name</th>
              <th>Location</th>
              <th>Message</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {visible.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>

                <td className={styles.contact}>
                  <LuMail />
                  {e.email}
                </td>

                <td>{e.messName}</td>
                <td>{e.location}</td>

                <td className={styles.message}>
                  {e.message.length > 25
                    ? e.message.slice(0, 25) + "..."
                    : e.message}
                </td>

                <td>{e.date}</td>

                <td>
                  <LuEllipsisVertical className={styles.actions} />
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
