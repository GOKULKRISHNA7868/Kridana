import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export default function TrainerSalaryPage({ instituteId }) {
  const [month, setMonth] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trainers, setTrainers] = useState([]);
  const [salaries, setSalaries] = useState([]);

  // Fetch trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      const q = query(
        collection(db, "InstituteTrainers"),
        where("instituteId", "==", instituteId)
      );
      const snap = await getDocs(q);
      setTrainers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchTrainers();
  }, [instituteId]);

  // Fetch salaries
  useEffect(() => {
    if (!month || !instituteId) return;

    const fetchSalaries = async () => {
      const q = query(
        collection(db, "institutes", instituteId, "trainerSalaries"),
        where("month", "==", month)
      );

      const snap = await getDocs(q);
      setSalaries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    fetchSalaries();
  }, [month, instituteId]);

  const getSalaryDoc = (trainerId) =>
    salaries.find((s) => s.trainerId === trainerId);

  // Generate Salary
  const generateSalary = async (trainer) => {
    const attendanceQ = query(
      collection(db, "institutes", instituteId, "trainerAttendance"),
      where("trainerId", "==", trainer.trainerUid),
      where("month", "==", month)
    );

    const attendanceSnap = await getDocs(attendanceQ);

    const presentDays = attendanceSnap.docs.filter(
      (d) => d.data().status === "present"
    ).length;

    const totalDays = new Date(
      month.split("-")[0],
      month.split("-")[1],
      0
    ).getDate();
    const perDay = trainer.monthlySalary / totalDays;
    const payable = Math.round(perDay * presentDays);

    const docId = `${trainer.trainerUid}_${month}`;

    await setDoc(doc(db, "institutes", instituteId, "trainerSalaries", docId), {
      trainerId: trainer.trainerUid,
      trainerName: trainer.firstName,
      month,
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
      monthlySalary: Number(trainer.monthlySalary),
      perDaySalary: perDay,
      payableSalary: payable,
      status: "generated",
      generatedAt: new Date(),
    });

    alert("Salary Generated");
  };

  // Mark Paid
  const markPaid = async (salaryId) => {
    await updateDoc(
      doc(db, "institutes", instituteId, "trainerSalaries", salaryId),
      {
        status: "paid",
        paidAt: new Date(),
        paymentMode: "Cash",
      }
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Trainer Salary Management</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <input type="month" onChange={(e) => setMonth(e.target.value)} />
        <select onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="generated">Generated</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>Trainer</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Payable</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {trainers.map((trainer) => {
            const salary = getSalaryDoc(trainer.trainerUid);
            const status = salary?.status || "pending";

            if (statusFilter !== "all" && status !== statusFilter) return null;

            return (
              <tr key={trainer.trainerUid}>
                <td>{trainer.firstName}</td>
                <td>{salary?.presentDays || "-"}</td>
                <td>{salary?.absentDays || "-"}</td>
                <td>₹{salary?.payableSalary || "-"}</td>
                <td>{status}</td>
                <td>
                  {status === "pending" && (
                    <button onClick={() => generateSalary(trainer)}>
                      Generate
                    </button>
                  )}
                  {status === "generated" && (
                    <button onClick={() => markPaid(salary.id)}>
                      Mark Paid
                    </button>
                  )}
                  {status === "paid" && "✔"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
