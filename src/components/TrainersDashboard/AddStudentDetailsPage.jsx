import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function TrainerAttendance() {
  const [trainerId, setTrainerId] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [timetable, setTimetable] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [attendance, setAttendance] = useState({});

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

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setTrainerId(user.uid);

      const trainerSnap = await getDocs(
        query(collection(db, "InstituteTrainers"), where("uid", "==", user.uid))
      );

      if (!trainerSnap.empty) {
        setInstituteId(trainerSnap.docs[0].data().instituteId);
      }
    });

    return () => unsub();
  }, []);

  /* ---------------- FETCH TIMETABLE ---------------- */
  useEffect(() => {
    if (!instituteId || !trainerId) return;

    const load = async () => {
      const snap = await getDocs(
        query(
          collection(db, "institutes", instituteId, "timetable"),
          where("trainerId", "==", trainerId)
        )
      );

      setTimetable(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    load();
  }, [instituteId, trainerId]);

  /* ---------------- FETCH STUDENTS ---------------- */
  const loadStudents = async (studentIds) => {
    const snap = await getDocs(collection(db, "students"));
    const filtered = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((s) => studentIds.includes(s.id));

    setStudents(filtered);
  };

  /* ---------------- SAVE ATTENDANCE ---------------- */
  const saveAttendance = async () => {
    if (!selectedSlot) return;

    const date = new Date().toISOString().split("T")[0];

    await addDoc(collection(db, "institutes", instituteId, "attendance"), {
      date,
      day: selectedSlot.day,
      time: selectedSlot.time,
      trainerId,
      category: selectedSlot.category,
      students: attendance,
      createdAt: serverTimestamp(),
    });

    alert("Attendance saved successfully!");
    setSelectedSlot(null);
    setAttendance({});
  };

  const getSlot = (day, time) =>
    timetable.find((t) => t.day === day && t.time === time);

  /* ================= UI ================= */
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6">Class Attendance</h2>

      {/* TIMETABLE GRID */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "100px repeat(7, 1fr)" }}
      >
        <div />
        {days.map((d) => (
          <div
            key={d}
            className="bg-gray-200 dark:bg-gray-700 text-center py-2 font-semibold"
          >
            {d}
          </div>
        ))}

        {times.map((time) => (
          <React.Fragment key={time}>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 font-semibold">
              {time}
            </div>

            {days.map((day) => {
              const slot = getSlot(day, time);
              return (
                <div
                  key={day + time}
                  className="border p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    if (!slot) return;
                    setSelectedSlot(slot);
                    loadStudents(slot.students);
                  }}
                >
                  {slot ? (
                    <>
                      <p className="font-semibold text-blue-600">
                        {slot.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        {slot.students.length} Students
                      </p>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* ATTENDANCE MODAL */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded w-[400px]">
            <h3 className="font-bold text-lg mb-3">
              Attendance - {selectedSlot.category}
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {students.map((s) => (
                <label
                  key={s.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>{s.firstName}</span>
                  <input
                    type="checkbox"
                    checked={attendance[s.id] || false}
                    onChange={(e) =>
                      setAttendance((prev) => ({
                        ...prev,
                        [s.id]: e.target.checked,
                      }))
                    }
                  />
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded w-full"
                onClick={saveAttendance}
              >
                Save Attendance
              </button>
              <button
                className="border px-4 py-2 rounded w-full"
                onClick={() => setSelectedSlot(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
