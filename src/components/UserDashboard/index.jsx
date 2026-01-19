// src/components/InstituteDashboard/InstituteDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import CheckinCheckout from "./CheckinCheckout";
import InstituteDataPage from "./InstituteDataPage";
import Studenttimetables from "./Student timetables";
import TrainersTimetables from "./TrainersTimetables";
import FeesDetailsPage from "./FeesDetailsPage";
import TakeAttendance from "./TakeAttendance";
import Myattendance from "./Myattendance";
import TrainerStudentAttendance from "./TrainerStudentAttendance";
import TrainerStudentsFee from "./TrainerStudentsFee";

const studentSidebarItems = [
  "Home",
  "Student Timetables",
  "My Attendance",
  "Fees Details",
  "Log Out",
];

const trainerSidebarItems = [
  "CheckinCheckout",
  "Trainer’s Timetables",
  "My Attendance",
  "Take Attendance",
  "Log Out",
];
const trainerStudentSidebarItems = [
  "TrainerStudentAttendance",
  "TrainerStudentsFee",
  "Log Out",
];

const InstituteDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Home");
  const { user } = useAuth();
  const navigate = useNavigate();
  const idleTimer = useRef(null);

  const [role, setRole] = useState(null);
  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);

  /* =============================
     ⏱ AUTO LOGOUT (5 MIN)
  ============================= */
  useEffect(() => {
    const resetTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(handleLogout, 5 * 60 * 1000);
    };

    ["mousemove", "keydown", "click", "scroll"].forEach((e) =>
      window.addEventListener(e, resetTimer)
    );
    resetTimer();

    return () => {
      ["mousemove", "keydown", "click", "scroll"].forEach((e) =>
        window.removeEventListener(e, resetTimer)
      );
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  /* =============================
     🚪 LOGOUT
  ============================= */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };

  /* =============================
     🔑 DETECT ROLE (FIXED)
  ============================= */
  /* =============================
   🔑 DETECT ROLE (EXTENDED)
============================= */
  useEffect(() => {
    if (!user?.uid) return;

    const detectRole = async () => {
      // student
      const studentSnap = await getDoc(doc(db, "students", user.uid));
      if (studentSnap.exists()) {
        setRole("student");
        return;
      }

      // trainer
      const trainerSnap = await getDoc(doc(db, "InstituteTrainers", user.uid));
      if (trainerSnap.exists()) {
        setRole("trainer");
        return;
      }

      // ✅ trainer-student
      const trainerStudentSnap = await getDoc(
        doc(db, "trainerstudents", user.uid)
      );
      if (trainerStudentSnap.exists()) {
        setRole("trainerstudent");
        return;
      }

      setRole(null);
    };

    detectRole();
  }, [user]);

  /* =============================
     📂 FETCH DATA (UNCHANGED)
  ============================= */
  useEffect(() => {
    if (!user?.uid) return;

    const studentsQuery = query(
      collection(db, "students"),
      where("instituteId", "==", user.uid)
    );

    const unsubStudents = onSnapshot(studentsQuery, (snap) => {
      setStudents(
        snap.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }))
      );
    });

    const trainersQuery = query(
      collection(db, "InstituteTrainers"),
      where("instituteId", "==", user.uid)
    );

    const unsubTrainers = onSnapshot(trainersQuery, (snap) => {
      setTrainers(
        snap.docs.map((doc) => ({
          trainerUid: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => {
      unsubStudents();
      unsubTrainers();
    };
  }, [user]);

  /* =============================
     📂 MAIN CONTENT
  ============================= */
  const renderMainContent = () => {
    switch (activeMenu) {
      case "Home":
        return <InstituteDataPage students={students} trainers={trainers} />;
      case "Student Timetables":
        return <Studenttimetables />;
      case "Trainer’s Timetables":
        return <TrainersTimetables />;
      case "Fees Details":
        return <FeesDetailsPage />;
      case "Take Attendance":
        return <TakeAttendance />;
      case "My Attendance":
        return <Myattendance />;
      case "TrainerStudentAttendance":
        return <TrainerStudentAttendance />;
      case "TrainerStudentsFee":
        return <TrainerStudentsFee />;
      case "CheckinCheckout":
        return <CheckinCheckout />;

      default:
        return null;
    }
  };

  const sidebarItems =
    role === "student"
      ? studentSidebarItems
      : role === "trainer"
      ? trainerSidebarItems
      : role === "trainerstudent"
      ? trainerStudentSidebarItems
      : [];

  return (
    <div className="min-h-screen flex bg-[#5a5a5a] text-white">
      <aside className="w-72 bg-orange-900">
        <div className="px-4 py-4 font-bold text-xl border-b">Dashboard</div>

        <div className="bg-orange-100 text-black">
          {sidebarItems.map((item) => (
            <button
              key={item}
              onClick={() =>
                item === "Log Out" ? handleLogout() : setActiveMenu(item)
              }
              className={`w-full px-4 py-3 text-left border-b ${
                item === activeMenu
                  ? "bg-orange-500 text-white"
                  : "hover:bg-orange-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 bg-[#4b301b] p-8 overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default InstituteDashboard;
