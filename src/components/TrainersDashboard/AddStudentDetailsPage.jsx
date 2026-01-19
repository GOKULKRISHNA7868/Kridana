import React, { useState } from "react";
import { db, auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

const AddStudentDetailsPage = () => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    category: "",
    joinedDate: "",
    email: "",
    phoneNumber: "",
    feeAmount: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trainer = auth.currentUser;
    if (!trainer) {
      alert("Trainer not logged in");
      return;
    }

    try {
      setLoading(true);

      const studentCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        "123456"
      );

      const studentUID = studentCredential.user.uid;

      await setDoc(doc(db, "trainerstudents", studentUID), {
        firstName: form.firstName,
        lastName: form.lastName,
        category: form.category,
        joinedDate: form.joinedDate,
        email: form.email,
        phoneNumber: form.phoneNumber,
        feeAmount: Number(form.feeAmount),
        trainerUID: trainer.uid,
        studentUID: studentUID,
        role: "student",
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "trainers", trainer.uid), {
        students: arrayUnion(studentUID),
      });

      alert("Student added successfully 🎉");

      setForm({
        firstName: "",
        lastName: "",
        category: "",
        joinedDate: "",
        email: "",
        phoneNumber: "",
        feeAmount: "",
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4b301b] dark:bg-gray-900 px-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-6 sm:px-10 py-8 sm:py-10 transition-colors">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-gray-900 dark:text-white text-center sm:text-left">
          Add Student Details
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <input
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 outline-none"
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 outline-none"
            />
            <input
              type="date"
              name="joinedDate"
              value={form.joinedDate}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 outline-none"
            />
            <input
              name="phoneNumber"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <div>
            <input
              type="number"
              name="feeAmount"
              placeholder="Fee Amount"
              value={form.feeAmount}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-16 py-3 rounded-md font-extrabold transition disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentDetailsPage;
