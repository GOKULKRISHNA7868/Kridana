import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

import TrainersTable from "./TrainersTable";
import StudentsAttendancePage from "./StudentsAttendancePage";
import FeesDetailsPage from "./FeesDetailsPage";
import AddStudentDetailsPage from "./AddStudentDetailsPage";
import PaymentsPage from "./PaymentsPage";
import { Pagination } from "./shared";
import Editprofile from "./Editprofile";
import MyStudents from "./MyStudents";
const sidebarItems = [
  "Home",
  "MyStudents",
  "Students Attendance",
  "Fees Details",
  "Add Student Details",
  "Inbox",
  "Shop",
  "Editprofile",
  "Categories",
  "Reports",
  "Payment Details",
  "Terms & Conditions",
  "Privacy Policy",
  "Log Out",
];

const TrainersDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Home");
  const [view, setView] = useState("trainersData");

  const [trainers, setTrainers] = useState(
    Array.from({ length: 8 }).map((_, i) => ({
      id: i + 1,
      name: `Students Name ${i + 1}`,
      batch: String(i + 1).padStart(2, "0"),
      phone: "+91",
    }))
  );

  const [search, setSearch] = useState("");

  const filteredTrainers = useMemo(
    () =>
      trainers.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      ),
    [trainers, search]
  );

  /* =============================
     🚪 LOGOUT (SAME AS INSTITUTE)
  ============================= */
  const handleLogout = async () => {
    console.log("Trainer logout clicked");
    try {
      await signOut(auth);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleMenuClick = (item) => {
    console.log("Menu clicked:", item);
    setActiveMenu(item);

    if (item === "Log Out") {
      handleLogout();
      return;
    }
    if (item === "MyStudents") {
      setView("MyStudents");
    }
    if (item === "Students Attendance") {
      setView("studentsAttendance");
    } else if (item === "Editprofile") {
      setView("Editprofile");
    } else if (item === "Fees Details") {
      setView("feesDetails");
    } else if (item === "Add Student Details") {
      setView("addStudent");
    } else if (item === "Payment Details") {
      setView("paymentDetails");
    } else if (item === "Home") {
      setView("trainersData");
    } else if (item === "Shop") {
      navigate("/shop");
    }
  };

  const renderMainContent = () => {
    if (view === "MyStudents") return <MyStudents />;
    if (view === "Editprofile") return <Editprofile />;
    if (view === "studentsAttendance") return <StudentsAttendancePage />;
    if (view === "feesDetails") return <FeesDetailsPage />;
    if (view === "addStudent") return <AddStudentDetailsPage />;
    if (view === "paymentDetails") return <PaymentsPage />;

    return (
      <>
        {/* Search bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center bg-[#3b2615] border border-[#6b4a2d] rounded-full px-4 py-2 w-full max-w-md">
            <span className="mr-2 text-lg text-gray-300">🔍</span>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-4 ml-6">
            <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-orange-500 text-xl">
              🔔
            </button>
            <button className="w-9 h-9 rounded-full bg-white" />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold text-orange-400">
            Trainers Data
          </h1>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              📅 Jan2026–Feb2026
            </button>
            <button className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              ➕ Add
            </button>
          </div>
        </div>

        <TrainersTable
          rows={filteredTrainers}
          onDelete={(id) =>
            setTrainers((prev) => prev.filter((t) => t.id !== id))
          }
        />

        <Pagination />
      </>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#5a5a5a] text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-orange-900 flex flex-col">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-orange-800">
          <div className="w-10 h-10 rounded-full bg-orange-700" />
          <span className="text-xl font-extrabold text-white">
            Institute name
          </span>
        </div>

        <div className="flex-1 bg-orange-100 text-black text-lg overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick(item);
              }}
              className={
                "w-full text-left px-4 py-3 border-b border-orange-200 transition-colors " +
                (item === activeMenu
                  ? "bg-orange-500 text-white font-semibold"
                  : "hover:bg-orange-200")
              }
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-[#4b301b] text-white px-10 py-8 overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default TrainersDashboard;
