import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get("role") || "user"; // role from URL

  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    emailPhone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Firebase Auth Login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.emailPhone,
        formData.password
      );

      const user = userCredential.user;

      // 2️⃣ Check all role collections
      const trainerRef = doc(db, "trainers", user.uid);
      const instituteRef = doc(db, "institutes", user.uid);

      const [trainerSnap, instituteSnap] = await Promise.all([
        getDoc(trainerRef),
        getDoc(instituteRef),
      ]);

      // 3️⃣ Determine ACTUAL role
      let actualRole = null;

      if (trainerSnap.exists()) actualRole = "trainer";
      if (instituteSnap.exists()) actualRole = "institute";

      // For user role: anyone who is NOT trainer or institute is allowed
      if (role === "user" && !actualRole) {
        actualRole = "user";
      }

      // ❌ Role mismatch only for trainer/institute
      if (role !== "user" && actualRole !== role) {
        await auth.signOut();
        alert(
          `Role mismatch. This account is registered as "${actualRole}". Please login using correct role.`
        );
        return;
      }

      // 4️⃣ ✅ Correct role → Redirect
      if (actualRole === "institute") {
        navigate("/institutes/dashboard", { replace: true });
      } else if (actualRole === "trainer") {
        navigate("/trainers/dashboard", { replace: true });
      } else {
        navigate("/landing", { replace: true });
      }
    } catch (error) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        alert("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        alert("Incorrect password.");
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6
      ${darkMode ? "bg-gray-900" : "bg-white"}`}
    >
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded-md text-sm font-medium border
          border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white transition"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full max-w-md rounded-xl shadow-lg p-8
        ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <h2 className="text-3xl font-bold mb-6 text-orange-500">
          {role === "institute"
            ? "Institute Sign In"
            : role === "trainer"
            ? "Trainer Sign In"
            : "Welcome Back to Kridana"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block mb-1 text-orange-500">
              E-mail / Phone Number*
            </label>
            <input
              type="text"
              name="emailPhone"
              value={formData.emailPhone}
              onChange={handleChange}
              required
              className={`w-full rounded-md p-3
              ${
                darkMode
                  ? "bg-gray-700 text-white border border-gray-600"
                  : "bg-white border border-orange-200"
              }`}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-orange-500">Password*</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full rounded-md p-3
              ${
                darkMode
                  ? "bg-gray-700 text-white border border-gray-600"
                  : "bg-white border border-orange-200"
              }`}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-orange-500 text-white p-3 rounded-md font-semibold
            hover:bg-orange-600 transition"
          >
            Sign In
          </motion.button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate(`/signup?role=${role}`)}
          >
            Sign Up
          </span>
        </p>
      </motion.div>
    </div>
  );
}
