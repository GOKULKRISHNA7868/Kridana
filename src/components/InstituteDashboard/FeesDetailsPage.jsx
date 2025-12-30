import React, { useEffect, useState, useMemo } from "react";
import {
  TopSearchWithActionsLight,
  FeesOrSalaryCharts,
  ListHeader,
  AmountsTable,
  Pagination,
} from "./shared";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

const FeesDetailsPage = () => {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [paidEdits, setPaidEdits] = useState({});

  /* ================= FETCH STUDENTS ================= */
  useEffect(() => {
    if (!user?.uid) return;

    const fetchStudents = async () => {
      // 1️⃣ Get institute doc
      const instituteSnap = await getDoc(doc(db, "institutes", user.uid));

      if (!instituteSnap.exists()) return;

      const studentIds = instituteSnap.data().students || [];

      // 2️⃣ Fetch students
      const studentDocs = await Promise.all(
        studentIds.map((id) => getDoc(doc(db, "students", id)))
      );

      const data = studentDocs
        .filter((d) => d.exists())
        .map((d) => ({
          id: d.id,
          ...d.data(),
          totalFee: Number(d.data().studentFee || 0),
          paidFee: 0,
        }));

      setStudents(data);
    };

    fetchStudents();
  }, [user]);

  /* ================= SAVE FEES ================= */
  const handleSave = async (student) => {
    const paid = Number(paidEdits[student.id] || 0);
    const pending = student.totalFee - paid;

    await setDoc(doc(collection(db, "studentFeeDetails")), {
      instituteId: user.uid,
      studentId: student.id,
      totalFee: student.totalFee,
      paidFee: paid,
      pendingFee: pending,
      status: pending <= 0 ? "settled" : "pending",
      updatedAt: serverTimestamp(),
    });

    alert("Fee updated successfully");
  };

  /* ================= TABLE ROWS ================= */
  const rows = useMemo(
    () =>
      students
        .filter((s) =>
          `${s.firstName} ${s.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase())
        )
        .map((s) => {
          const paid = Number(paidEdits[s.id] || 0);
          const pending = s.totalFee - paid;

          return {
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            batch: s.category,
            total: s.totalFee,
            paid: (
              <input
                type="number"
                className="w-24 border px-2 py-1 rounded"
                value={paidEdits[s.id] || ""}
                onChange={(e) =>
                  setPaidEdits({
                    ...paidEdits,
                    [s.id]: e.target.value,
                  })
                }
              />
            ),
            pending:
              pending <= 0 ? (
                <span className="text-green-600 font-bold">Settled</span>
              ) : (
                pending
              ),
            action: (
              <button
                onClick={() => handleSave(s)}
                className="bg-orange-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            ),
          };
        }),
    [students, search, paidEdits]
  );

  /* ================= TOTALS ================= */
  const totalAmount = students.reduce((sum, s) => sum + s.totalFee, 0);

  const totalPaid = Object.values(paidEdits).reduce(
    (sum, v) => sum + Number(v || 0),
    0
  );

  return (
    <div className="h-full bg-white text-black p-6 rounded-lg">
      <TopSearchWithActionsLight search={search} setSearch={setSearch} />

      <FeesOrSalaryCharts
        totalLabel={`Total Fees Amount ₹${totalAmount}`}
        paidLabel={`Total Paid ₹${totalPaid}`}
        pendingLabel={`Pending ₹${totalAmount - totalPaid}`}
        peopleLabel={`Total Students ${students.length}`}
      />

      <ListHeader title="Student Fee Collection" />

      <AmountsTable rows={rows} firstColLabel="Student Name" showAction />

      <Pagination />
    </div>
  );
};

export default FeesDetailsPage;
