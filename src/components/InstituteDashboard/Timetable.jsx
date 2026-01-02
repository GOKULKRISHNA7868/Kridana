import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ClassTime() {
  const navigate = useNavigate();

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const times = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  const [instituteId, setInstituteId] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    day: "Mon",
    time: "09:00",
    category: "",
    trainerId: "",
    students: [],
  });

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setInstituteId(user.uid);
    });
    return () => unsub();
  }, []);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!instituteId) return;

    const loadData = async () => {
      const trainerSnap = await getDocs(
        query(
          collection(db, "InstituteTrainers"),
          where("instituteId", "==", instituteId)
        )
      );
      setTrainers(trainerSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const studentSnap = await getDocs(
        query(
          collection(db, "students"),
          where("instituteId", "==", instituteId)
        )
      );
      setStudents(studentSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const timetableSnap = await getDocs(
        collection(db, "institutes", instituteId, "timetable")
      );
      setSchedule(timetableSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    loadData();
  }, [instituteId]);

  /* ---------------- SAVE / UPDATE ---------------- */
  const saveClass = async () => {
    if (!form.category || !form.trainerId || form.students.length === 0) {
      alert("Please fill all fields");
      return;
    }

    const trainer = trainers.find((t) => t.id === form.trainerId);

    const payload = {
      day: form.day,
      time: form.time,
      category: form.category,
      trainerId: trainer.id,
      trainerName: trainer.firstName,
      students: form.students,
      updatedAt: serverTimestamp(),
    };

    if (editId) {
      await updateDoc(
        doc(db, "institutes", instituteId, "timetable", editId),
        payload
      );
    } else {
      await addDoc(collection(db, "institutes", instituteId, "timetable"), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }

    setShowModal(false);
    setEditId(null);
    setForm({
      day: "Mon",
      time: "09:00",
      category: "",
      trainerId: "",
      students: [],
    });

    const snap = await getDocs(
      collection(db, "institutes", instituteId, "timetable")
    );
    setSchedule(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const getSlot = (day, time) =>
    schedule.find((s) => s.day === day && s.time === time);

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg min-h-screen text-black dark:text-white">
      <h2 className="text-2xl font-bold mb-6">Weekly Timetable</h2>

      <div
        className="grid"
        style={{ gridTemplateColumns: "100px repeat(7,1fr)" }}
      >
        <div></div>
        {days.map((d) => (
          <div
            key={d}
            className="text-center font-semibold bg-gray-200 dark:bg-gray-700 py-2"
          >
            {d}
          </div>
        ))}

        {times.map((time) => (
          <React.Fragment key={time}>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 font-semibold">
              {time}
            </div>

            {days.map((day) => {
              const slot = getSlot(day, time);
              return (
                <div
                  key={day + time}
                  className="border p-2 min-h-[70px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    if (slot) {
                      setEditId(slot.id);
                      setForm({
                        day: slot.day,
                        time: slot.time,
                        category: slot.category,
                        trainerId: slot.trainerId,
                        students: slot.students,
                      });
                    } else {
                      setEditId(null);
                      setForm({
                        day,
                        time,
                        category: "",
                        trainerId: "",
                        students: [],
                      });
                    }
                    setShowModal(true);
                  }}
                >
                  {slot && (
                    <>
                      <p className="font-semibold">{slot.category}</p>
                      <p className="text-sm text-blue-600">
                        {slot.trainerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Students: {slot.students.length}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded w-[360px] space-y-3">
            <h3 className="text-lg font-bold">
              {editId ? "Edit Class" : "Add Class"}
            </h3>

            <input
              className="w-full border p-2 bg-transparent"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <select
              className="w-full border p-2 bg-transparent"
              value={form.trainerId}
              onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
            >
              <option value="">Select Trainer</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName}
                </option>
              ))}
            </select>

            <select
              multiple
              className="w-full border p-2 h-28 bg-transparent"
              value={form.students}
              onChange={(e) =>
                setForm({
                  ...form,
                  students: Array.from(e.target.selectedOptions).map(
                    (o) => o.value
                  ),
                })
              }
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName}
                </option>
              ))}
            </select>

            <button
              onClick={saveClass}
              className="bg-green-600 text-white w-full py-2 rounded"
            >
              {editId ? "Update Class" : "Save Class"}
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="w-full text-sm mt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
