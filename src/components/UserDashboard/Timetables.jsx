import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function StudentTimetable() {
  const [studentId, setStudentId] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [schedule, setSchedule] = useState([]);

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

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      setStudentId(user.uid);

      // Fetch student document
      const studentSnap = await getDocs(
        query(collection(db, "students"), where("uid", "==", user.uid))
      );

      if (!studentSnap.empty) {
        const studentData = studentSnap.docs[0].data();
        setInstituteId(studentData.instituteId);
      }
    });

    return () => unsub();
  }, []);

  /* ================= FETCH TIMETABLE ================= */
  useEffect(() => {
    if (!studentId || !instituteId) return;

    const loadTimetable = async () => {
      const snap = await getDocs(
        collection(db, "institutes", instituteId, "timetable")
      );

      const filtered = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => t.students?.includes(studentId));

      setSchedule(filtered);
    };

    loadTimetable();
  }, [studentId, instituteId]);

  const getSlot = (day, time) =>
    schedule.find((s) => s.day === day && s.time === time);

  /* ================= UI ================= */
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen p-6 text-black dark:text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        My Weekly Timetable
      </h2>

      <div
        className="grid"
        style={{ gridTemplateColumns: "100px repeat(7, 1fr)" }}
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
                  className="border p-2 min-h-[70px] text-sm bg-white dark:bg-gray-800"
                >
                  {slot ? (
                    <>
                      <p className="font-semibold text-blue-600">
                        {slot.category}
                      </p>
                      <p className="text-sm">{slot.trainerName}</p>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
