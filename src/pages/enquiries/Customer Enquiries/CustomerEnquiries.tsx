import { useState } from "react";
import styles from "./CustomerEnquiries.module.css";
import { LuEllipsisVertical, LuMail, LuEye } from "react-icons/lu";

const dummyCustomerEnquiries = [
  {
    id: 1,
    name: "Rahul",
    email: "rahul@gmail.com",
    messName: "Riseres Mess",
    location: "Alappuzha - 690542",
    message: "Do you provide non veg meals?",
    date: "04 Feb 2026",
  },
  {
    id: 2,
    name: "Anu",
    email: "anu@gmail.com",
    messName: "Sunrise Mess",
    location: "Kollam - 691001",
    message: "Is monthly subscription available?",
    date: "05 Feb 2026",
  },
];

export default function CustomerEnquiries() {
  const [page, setPage] = useState(1);
  const limit = 5;

  const totalPages = Math.ceil(dummyCustomerEnquiries.length / limit);
  const visible = dummyCustomerEnquiries.slice(
    (page - 1) * limit,
    page * limit
  );

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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {visible.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>

                <td className={styles.contact}>
                  <LuMail /> {e.email}
                </td>

                <td>{e.messName}</td>
                <td>{e.location}</td>

                <td className={styles.message}>
                  {e.message.length > 30
                    ? e.message.slice(0, 30) + "..."
                    : e.message}
                </td>

                <td>{e.date}</td>

                <td className={styles.actions}>
                  <LuEye />
                  <LuEllipsisVertical />
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
