import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Pagination } from "./shared";

const StudentsAttendancePage = () => {
  const user = auth.currentUser;

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const currentMonth = selectedDate.slice(0, 7);

  const [trainerUID, setTrainerUID] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔄 NEW: Track which student is updating
  const [savingStudentId, setSavingStudentId] = useState(null);

  /* ======================================
     🔍 RESOLVE TRAINER UID
     ====================================== */
  useEffect(() => {
    if (!user) return;

    const resolveTrainerUID = async () => {
      const trainerSnap = await getDoc(doc(db, "trainers", user.uid));
      if (trainerSnap.exists()) {
        setTrainerUID(user.uid);
        return;
      }

      const studentSnap = await getDoc(doc(db, "trainerstudents", user.uid));
      if (studentSnap.exists()) {
        setTrainerUID(studentSnap.data().trainerUID);
      }
    };

    resolveTrainerUID();
  }, [user]);

  /* ======================================
     🎓 FETCH STUDENTS
     ====================================== */
  useEffect(() => {
    if (!trainerUID) return;

    const fetchStudents = async () => {
      const trainerSnap = await getDoc(doc(db, "trainers", trainerUID));
      if (!trainerSnap.exists()) return;

      const ids = trainerSnap.data().students || [];

      const list = await Promise.all(
        ids.map(async (id) => {
          const snap = await getDoc(doc(db, "trainerstudents", id));
          if (!snap.exists()) return null;
          return { id, ...snap.data() };
        })
      );

      setStudents(list.filter(Boolean));
      setLoading(false);
    };

    fetchStudents();
  }, [trainerUID]);

  /* ======================================
     📅 FETCH ATTENDANCE (MONTH)
     ====================================== */
  useEffect(() => {
    if (!trainerUID) return;

    const fetchAttendance = async () => {
      const docId = `${trainerUID}_${currentMonth}`;
      const snap = await getDoc(doc(db, "trainerstudentsattendance", docId));

      setAttendanceData(snap.exists() ? snap.data().records || {} : {});
    };

    fetchAttendance();
  }, [trainerUID, currentMonth]);

  /* ======================================
     📅 DATE VALIDATION
     ====================================== */
  const canEditAttendance = (joinedDate) => {
    const selected = new Date(selectedDate);
    return selected >= new Date(joinedDate) && selected <= new Date(today);
  };

  const getBlockMessage = (joinedDate) => {
    const selected = new Date(selectedDate);
    if (selected < new Date(joinedDate))
      return "⚠️ Attendance cannot be marked before joining date";
    if (selected > new Date(today))
      return "⚠️ Future date attendance is not allowed";
    return "";
  };

  /* ======================================
     ✅ UPDATE ATTENDANCE (WITH LOADER)
     ====================================== */
  const markAttendance = async (studentUID, status, joinedDate) => {
    if (!canEditAttendance(joinedDate)) {
      setMessage(getBlockMessage(joinedDate));
      return;
    }

    try {
      setSavingStudentId(studentUID);
      setMessage("");

      const docId = `${trainerUID}_${currentMonth}`;

      await setDoc(
        doc(db, "trainerstudentsattendance", docId),
        {
          trainerUID,
          month: currentMonth,
          updatedAt: serverTimestamp(),
          records: {
            [studentUID]: {
              [selectedDate]: status,
            },
          },
        },
        { merge: true }
      );

      setAttendanceData((prev) => ({
        ...prev,
        [studentUID]: {
          ...(prev[studentUID] || {}),
          [selectedDate]: status,
        },
      }));

      setMessage("✅ Attendance saved successfully");
    } catch (err) {
      console.error("🔥 Attendance update failed:", err);
      setMessage("❌ Failed to update attendance");
    } finally {
      setSavingStudentId(null);
    }
  };

  /* ======================================
     📊 COUNT PRESENT / ABSENT
     ====================================== */
  const getCounts = (studentUID) => {
    const records = attendanceData[studentUID] || {};
    let present = 0;
    let absent = 0;

    Object.values(records).forEach((v) => {
      if (v === "present") present++;
      if (v === "absent") absent++;
    });

    return { present, absent };
  };

  /* ======================================
     🔍 SEARCH FILTER
     ====================================== */
  const filteredRows = useMemo(
    () =>
      students.filter((s) =>
        `${s.firstName} ${s.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [students, search]
  );

  if (loading) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="h-full bg-[#1b0f06] text-white p-6 rounded-lg">
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#3b2615] border border-[#6b4a2d] rounded-full px-4 py-2 text-sm outline-none"
        />

        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setMessage("");
          }}
          className="bg-[#3b2615] border border-[#6b4a2d] rounded-full px-4 py-2 text-sm outline-none"
        />
      </div>

      {message && (
        <div className="mb-3 text-yellow-400 font-semibold text-sm">
          {message}
        </div>
      )}

      <div className="bg-[#f9c199] rounded-t-xl overflow-hidden">
        <div className="grid grid-cols-7 px-4 py-3 text-black font-semibold">
          <div>Name</div>
          <div>Category</div>
          <div>Joined</div>
          <div>Present</div>
          <div>Absent</div>
          <div>P</div>
          <div>A</div>
        </div>

        <div className="bg-white text-black">
          {filteredRows.map((s) => {
            const todayStatus = attendanceData[s.id]?.[selectedDate];
            const counts = getCounts(s.id);
            const editable = canEditAttendance(s.joinedDate);
            const saving = savingStudentId === s.id;

            return (
              <div
                key={s.id}
                className="grid grid-cols-7 px-4 py-3 border-t items-center text-sm"
              >
                <div>
                  {s.firstName} {s.lastName}
                </div>
                <div>{s.category}</div>
                <div className="text-xs text-gray-600">{s.joinedDate}</div>

                <button
                  disabled={!editable || saving}
                  onClick={() => markAttendance(s.id, "present", s.joinedDate)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    todayStatus === "present"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200"
                  } ${
                    (!editable || saving) && "opacity-50 cursor-not-allowed"
                  }`}
                >
                  {saving ? "Saving..." : "Present"}
                </button>

                <button
                  disabled={!editable || saving}
                  onClick={() => markAttendance(s.id, "absent", s.joinedDate)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    todayStatus === "absent"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200"
                  } ${
                    (!editable || saving) && "opacity-50 cursor-not-allowed"
                  }`}
                >
                  {saving ? "Saving..." : "Absent"}
                </button>

                <div className="font-semibold text-green-600">
                  {counts.present}
                </div>
                <div className="font-semibold text-red-600">
                  {counts.absent}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Pagination />
    </div>
  );
};

export default StudentsAttendancePage;
