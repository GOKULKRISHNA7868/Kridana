import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const TrainerFees = () => {
  const trainerId = auth.currentUser?.uid;

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeHistory, setFeeHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [feeData, setFeeData] = useState({
    month: "",
    year: new Date().getFullYear(),
    baseFee: "",
    discount: "",
    extra: "",
    paymentMode: "Cash",
    remarks: "",
  });

  /* ================= FETCH TRAINER STUDENTS ================= */
  useEffect(() => {
    if (!trainerId) return;

    const fetchStudents = async () => {
      const q = query(
        collection(db, "trainerstudents"),
        where("trainerUID", "==", trainerId)
      );

      const snap = await getDocs(q);
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchStudents();
  }, [trainerId]);

  /* ================= FETCH FEES ================= */
  const fetchFeeHistory = async (studentDocId) => {
    const q = collection(db, "trainerstudents", studentDocId, "fees");

    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    data.sort((a, b) =>
      `${b.year}${b.month}`.localeCompare(`${a.year}${a.month}`)
    );

    setFeeHistory(data);
  };

  /* ================= RECEIPT ================= */
  const generateReceiptNo = () => {
    const d = new Date();
    return `TRN-${d.getFullYear()}${d.getMonth() + 1}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
  };

  /* ================= GENERATE FEE ================= */
  const generateFee = async () => {
    if (!selectedStudent) return alert("Select student");
    if (!feeData.month || !feeData.baseFee || Number(feeData.baseFee) <= 0) {
      return alert("Month & valid Base Fee required");
    }

    const exists = feeHistory.find(
      (f) => f.month === feeData.month && f.year === feeData.year
    );
    if (exists) return alert("Fee already generated for this month");

    const total =
      Number(feeData.baseFee || 0) -
      Number(feeData.discount || 0) +
      Number(feeData.extra || 0);

    await addDoc(
      collection(db, "trainerstudents", selectedStudent.id, "fees"),
      {
        trainerUID: trainerId,
        studentUID: selectedStudent.studentUID,
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        month: feeData.month,
        year: feeData.year,
        baseFee: Number(feeData.baseFee),
        discount: Number(feeData.discount),
        extraCharges: Number(feeData.extra),
        finalAmount: total,
        paymentMode: feeData.paymentMode,
        receiptNo: generateReceiptNo(),
        remarks: feeData.remarks,
        status: "pending",
        createdAt: serverTimestamp(),
      }
    );

    alert("Fee generated");
    fetchFeeHistory(selectedStudent.id);
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (feeId, status) => {
    await updateDoc(
      doc(db, "trainerstudents", selectedStudent.id, "fees", feeId),
      {
        status,
        paidAt: status === "paid" ? serverTimestamp() : null,
      }
    );
    fetchFeeHistory(selectedStudent.id);
  };

  /* ================= DELETE ================= */
  const deleteFee = async (feeId) => {
    if (!window.confirm("Delete fee record?")) return;

    await deleteDoc(
      doc(db, "trainerstudents", selectedStudent.id, "fees", feeId)
    );
    fetchFeeHistory(selectedStudent.id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-gray-100">
      <h1 className="text-2xl font-bold mb-6">Trainer Fee Management</h1>

      {/* STUDENTS */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {students.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                setSelectedStudent(s);
                fetchFeeHistory(s.id);
              }}
              className="bg-gray-800 border border-gray-700 p-4 rounded cursor-pointer hover:border-blue-500"
            >
              <h3 className="font-semibold">
                {s.firstName} {s.lastName}
              </h3>
              <p className="text-sm text-gray-400">Category: {s.category}</p>
              <p className="text-sm">Fee: ₹{s.feeAmount}</p>
            </div>
          ))}
        </div>
      )}

      {/* FEE FORM */}
      {selectedStudent && (
        <div className="mt-8 bg-gray-900 p-6 rounded border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">
            Fee — {selectedStudent.firstName}
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="month"
              className="input"
              onChange={(e) =>
                setFeeData({
                  ...feeData,
                  month: e.target.value.split("-")[1],
                  year: e.target.value.split("-")[0],
                })
              }
            />

            <input
              type="number"
              className="input"
              placeholder="Base Fee"
              defaultValue={selectedStudent.feeAmount}
              onChange={(e) =>
                setFeeData({ ...feeData, baseFee: e.target.value })
              }
            />

            <input
              type="number"
              className="input"
              placeholder="Discount"
              onChange={(e) =>
                setFeeData({ ...feeData, discount: e.target.value })
              }
            />

            <input
              type="number"
              className="input"
              placeholder="Extra Charges"
              onChange={(e) =>
                setFeeData({ ...feeData, extra: e.target.value })
              }
            />

            <select
              className="input"
              onChange={(e) =>
                setFeeData({ ...feeData, paymentMode: e.target.value })
              }
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Bank</option>
            </select>

            <input
              className="input"
              placeholder="Remarks"
              onChange={(e) =>
                setFeeData({ ...feeData, remarks: e.target.value })
              }
            />
          </div>

          <button
            onClick={generateFee}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
          >
            Generate Fee
          </button>

          {/* HISTORY */}
          <h3 className="mt-8 font-semibold">Fee History</h3>
          <table className="w-full border border-gray-700 mt-3 text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th>Month</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {feeHistory.map((f) => (
                <tr key={f.id} className="border-t border-gray-700">
                  <td>
                    {f.month}/{f.year}
                  </td>
                  <td>₹{f.finalAmount}</td>
                  <td
                    className={
                      f.status === "paid" ? "text-green-400" : "text-yellow-400"
                    }
                  >
                    {f.status}
                  </td>
                  <td>{f.receiptNo}</td>
                  <td className="flex gap-3">
                    <button
                      onClick={() => updateStatus(f.id, "paid")}
                      className="text-green-400"
                    >
                      Paid
                    </button>
                    <button
                      onClick={() => deleteFee(f.id)}
                      className="text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrainerFees;
