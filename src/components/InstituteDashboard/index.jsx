// src/components/InstituteDashboard/InstituteDashboard.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { collection, query, where, onSnapshot } from "firebase/firestore";

import InstituteDataPage from "./InstituteDataPage";
import StudentsAttendancePage from "./StudentsAttendancePage";
import TrainersAttendancePage from "./TrainersAttendancePage";
import FeesDetailsPage from "./FeesDetailsPage";
import SalaryDetailsPage from "./SalaryDetailsPage";
import AddTrainerDetailsPage from "./AddTrainerDetailsPage";
import AddStudentDetailsPage from "./AddStudentDetailsPage";
import PaymentsPage from "./PaymentsPage";
import Editprofile from "./Editprofile";

const sidebarItems = [
  "Home",
  "Edit Profile",
  "Students Attendance",
  "Trainer’s Attendance",
  "Fees Details",
  "Salary Details",
  "Add Trainer Details",
  "Add Student Details",
  "Inbox",
  "Shop",

  "Categories",
  "Reports",
  "Payment Details",
  "Terms & Conditions",
  "Privacy Policy",
  "Log Out",
];

const InstituteDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Home");
  const { institute, user } = useAuth();
  const idleTimer = useRef(null);
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);

  /* =============================
     ⏱ AUTO LOGOUT (5 MIN IDLE)
  ============================= */
  useEffect(() => {
    const resetTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => handleLogout(), 5 * 60 * 1000);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  /* =============================
     🚪 LOGOUT
  ============================= */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  /* =============================
     📂 FETCH STUDENTS AND TRAINERS FROM FIREBASE
  ============================= */
  useEffect(() => {
    if (!user?.uid) return;

    // Students
    const studentsQuery = query(
      collection(db, "students"),
      where("instituteId", "==", user.uid)
    );
    const unsubStudents = onSnapshot(studentsQuery, (snap) => {
      const data = snap.docs.map((doc) => ({
        uid: doc.id,
        firstName: doc.data().firstName || "",
        lastName: doc.data().lastName || "",
        phone: doc.data().phone || "",
        batch: doc.data().batch || doc.data().category || "",
      }));
      setStudents(data);
    });

    // Trainers
    const trainersQuery = query(
      collection(db, "InstituteTrainers"),
      where("instituteId", "==", user.uid)
    );
    const unsubTrainers = onSnapshot(trainersQuery, (snap) => {
      const data = snap.docs.map((doc) => ({
        trainerUid: doc.id,
        firstName: doc.data().firstName || "",
        lastName: doc.data().lastName || "",
        category: doc.data().category || "",
        phone: doc.data().phone || "",
      }));
      setTrainers(data);
    });

    return () => {
      unsubStudents();
      unsubTrainers();
    };
  }, [user]);

  /* =============================
     📂 RENDER MAIN CONTENT
  ============================= */
  const renderMainContent = () => {
    switch (activeMenu) {
      case "Home":
        return (
          <InstituteDataPage
            students={students}
            trainers={trainers}
            onDeleteStudent={(uid) =>
              setStudents((prev) => prev.filter((s) => s.uid !== uid))
            }
            onDeleteTrainer={(trainerUid) =>
              setTrainers((prev) =>
                prev.filter((t) => t.trainerUid !== trainerUid)
              )
            }
          />
        );
      case "Edit Profile":
        return <Editprofile />;
      case "Students Attendance":
        return <StudentsAttendancePage />;
      case "Trainer’s Attendance":
        return <TrainersAttendancePage />;
      case "Fees Details":
        return <FeesDetailsPage />;
      case "Salary Details":
        return <SalaryDetailsPage />;
      case "Add Trainer Details":
        return <AddTrainerDetailsPage />;
      case "Add Student Details":
        return <AddStudentDetailsPage />;
      case "Payment Details":
        return <PaymentsPage />;
      default:
        return (
          <div className="text-white">
            <h1 className="text-4xl font-extrabold mb-4">{activeMenu}</h1>
            <p className="text-lg text-orange-100 max-w-xl">
              This section will be connected to data later.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-[#5a5a5a] text-white">
      <aside className="w-72 bg-orange-900 flex flex-col">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-orange-800">
          <div className="w-10 h-10 rounded-full bg-orange-700" />
          <span className="text-xl font-extrabold">
            {institute?.instituteName || "Institute"}
          </span>
        </div>

        <div className="flex-1 bg-orange-100 text-black text-lg overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (item === "Log Out") {
                  handleLogout();
                  return;
                }
                setActiveMenu(item);
                if (item === "Shop") navigate("/shop");
              }}
              className={`w-full text-left px-4 py-3 border-b border-orange-200 ${
                item === activeMenu
                  ? "bg-orange-500 text-white font-semibold"
                  : "hover:bg-orange-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 bg-[#4b301b] px-10 py-8 overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default InstituteDashboard;
