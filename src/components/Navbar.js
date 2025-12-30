import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { User } from "lucide-react"; // User avatar icon

const serviceTypes = [
  { name: "Martial Arts", path: "/services/Martial-Arts" },
  { name: "Team Ball Sports", path: "/services/Teamball" },
  { name: "Racket Sports", path: "/services/racket-sports" },
  { name: "Fitness", path: "/services/Fitness" },
  {
    name: "Target & Precision Sports",
    path: "/services/target-precision-sports",
  },
  { name: "Equestrian Sports", path: "/services/EquestrianSports" },
  {
    name: "Adventure & Outdoor Sports",
    path: "/services/AdventureOutdoorSports",
  },
  { name: "Ice Sports", path: "/services/ice-sports" },
  { name: "Wellness", path: "/services/wellness" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'institute', 'trainer', 'user'
  const [dropdownOpen, setDropdownOpen] = useState(false); // For avatar dropdown
  const navigate = useNavigate();

  // Fetch logged-in user role
  useEffect(() => {
    const fetchUserRole = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const trainerSnap = await getDoc(doc(db, "trainers", currentUser.uid));
      if (trainerSnap.exists()) {
        setUserRole("trainer");
        return;
      }

      const instituteSnap = await getDoc(
        doc(db, "institutes", currentUser.uid)
      );
      if (instituteSnap.exists()) {
        setUserRole("institute");
        return;
      }

      // ✅ Default fallback for all remaining users
      setUserRole("user");
    };

    fetchUserRole();
  }, []);

  const handleDashboardNavigation = () => {
    if (userRole === "institute") navigate("/institutes/dashboard");
    else if (userRole === "trainer") navigate("/trainers/dashboard");
    else navigate("/user/dashboard"); // ✅ normal users
    setDropdownOpen(false);
  };

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="text-2xl font-bold text-orange-600 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Kridana
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/Landing" className="nav-link">
              Home
            </NavLink>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServiceOpen(true)}
              onMouseLeave={() => setServiceOpen(false)}
            >
              <button className="font-medium text-gray-700 hover:text-orange-600 transition">
                Services
              </button>

              {serviceOpen && (
                <div className="absolute top-8 left-0 w-52 bg-white shadow-lg rounded-lg border">
                  {serviceTypes.map((service) => (
                    <NavLink
                      key={service.path}
                      to={service.path}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      {service.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/trainers" className="nav-link">
              Trainers
            </NavLink>
            <NavLink to="/shop" className="nav-link">
              Shop
            </NavLink>
            <NavLink to="/ViewTrainers" className="nav-link">
              Contact
            </NavLink>

            {/* User Avatar / Dashboard */}
            {auth.currentUser && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <User className="w-6 h-6 text-gray-700" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border z-50">
                    <button
                      onClick={handleDashboardNavigation}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      {userRole === "institute"
                        ? "Institute Dashboard"
                        : userRole === "trainer"
                        ? "Trainer Dashboard"
                        : "User Dashboard"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sign Up */}
            {!auth.currentUser && (
              <button
                onClick={() => navigate("/signup")}
                className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Sign Up
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white px-6 pb-6 space-y-4">
          <NavLink to="/Landing" onClick={() => setIsOpen(false)}>
            Home
          </NavLink>

          {/* Mobile Services */}
          <div>
            <p className="font-medium text-gray-700 mb-2">Services</p>
            <div className="pl-4 space-y-2">
              {serviceTypes.map((service) => (
                <NavLink
                  key={service.path}
                  to={service.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-600 hover:text-orange-600"
                >
                  {service.name}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink to="/trainers" onClick={() => setIsOpen(false)}>
            Trainers
          </NavLink>
          <NavLink to="/shop" onClick={() => setIsOpen(false)}>
            Shop
          </NavLink>
          <NavLink to="/contact" onClick={() => setIsOpen(false)}>
            Contact
          </NavLink>

          {/* Mobile Dashboard */}
          {auth.currentUser && (
            <button
              onClick={handleDashboardNavigation}
              className="block text-left text-gray-700 hover:text-orange-600"
            >
              {userRole === "institute"
                ? "Institute Dashboard"
                : userRole === "trainer"
                ? "Trainer Dashboard"
                : "User Dashboard"}
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
