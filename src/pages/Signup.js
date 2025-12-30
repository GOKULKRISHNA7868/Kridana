// src/pages/Signup.js  (used for normal users, and institute via ?role=institute)
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get("role") || "user"; // default user

  const [formData, setFormData] = useState({
    name: "",
    emailPhone: "",
    password: "",
    rePassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.rePassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // 🔹 USER signup only
      if (role === "user") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.emailPhone,
          formData.password
        );

        const user = userCredential.user;

        // 🔹 Save to USERS collection
        await setDoc(doc(db, "users", user.uid), {
          name: formData.name,
          emailOrPhone: formData.emailPhone,
          role: "user",
          createdAt: serverTimestamp(),
        });

        console.log("User registered successfully");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-orange-500">
          {role === "institute"
            ? "Register Your Institute"
            : "Join Kridana Sports"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-orange-500">
              {role === "institute" ? "Institute Name*" : "Name*"}
            </label>
            <input
              type="text"
              name="name"
              placeholder={
                role === "institute" ? "Enter Institute Name" : "Enter Name"
              }
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-orange-200 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-orange-500">
              E-mail/Phone Number*
            </label>
            <input
              type="text"
              name="emailPhone"
              placeholder="Enter Mail/Phone"
              value={formData.emailPhone}
              onChange={handleChange}
              required
              className="w-full border border-orange-200 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-orange-500">Password*</label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-orange-200 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-orange-500">Re-Password*</label>
            <input
              type="password"
              name="rePassword"
              placeholder="Re-enter Password"
              value={formData.rePassword}
              onChange={handleChange}
              required
              className="w-full border border-orange-200 rounded-md p-2"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-orange-500 text-white p-3 rounded-md font-semibold hover:bg-orange-600 transition-colors"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-gray-700">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
