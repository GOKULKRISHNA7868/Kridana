import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  UserCheck,
  Calendar,
  Award,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";

export default function InstituteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inst, setInst] = useState(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "institutes", id));
      if (snap.exists()) setInst({ id: snap.id, ...snap.data() });
    };
    load();
  }, [id]);

  useEffect(() => {
    const auth = getAuth();
    if (!auth.currentUser) {
      navigate("/login");
    }
  }, []);

  const handleRating = async (star) => {
    const user = auth.currentUser;
    if (!user || !inst) return;

    const ratings = inst.ratingsByUser || {};

    // 🚫 BLOCK multiple reviews
    if (ratings[user.uid] !== undefined) {
      alert("You have already submitted your review.");
      return;
    }

    const count = inst.ratingCount || 0;
    const avg = inst.rating || 0;

    const newAvg = (avg * count + star) / (count + 1);

    await updateDoc(doc(db, "institutes", id), {
      rating: newAvg,
      ratingCount: count + 1,
      [`ratingsByUser.${user.uid}`]: star,
    });

    // 🔄 Update UI
    setInst((prev) => ({
      ...prev,
      rating: newAvg,
      ratingCount: count + 1,
      ratingsByUser: {
        ...ratings,
        [user.uid]: star,
      },
    }));
  };

  if (!inst) return null;

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    inst.address
  )}&output=embed`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-white px-5 md:px-24 py-10"
    >
      {/* 🔙 Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#ff7a00] font-semibold mb-6 hover:gap-3 transition-all"
      >
        <ArrowLeft size={20} /> Back to Institutes
      </button>

      {/* 🏫 HEADER */}
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h1 className="text-4xl font-bold text-[#ff7a00]">
            {inst.instituteName}
          </h1>

          <p className="flex items-center gap-2 text-gray-600 mt-3">
            <MapPin size={18} /> {inst.address}, {inst.city}, {inst.state}
          </p>

          {/* ⭐ Rating */}
          <div className="flex gap-2 my-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                onClick={() => handleRating(s)}
                className={`text-3xl cursor-pointer transition ${
                  inst.ratingsByUser?.[auth.currentUser?.uid] >= s
                    ? "text-yellow-400 scale-110"
                    : "text-gray-300"
                }`}
              >
                ⭐
              </span>
            ))}
          </div>

          <p className="font-semibold text-gray-700">
            Average Rating:{" "}
            {inst.rating ? inst.rating.toFixed(1) : "No ratings"}{" "}
            {inst.ratingCount ? `(${inst.ratingCount})` : ""}
          </p>

          {/* 📞 CONTACT BUTTONS */}
          <div className="flex flex-wrap gap-4 mt-6">
            <a
              href={`tel:${inst.phoneNumber}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ff7a00] text-white hover:scale-105 transition"
            >
              <Phone size={18} /> Call
            </a>

            <a
              href={`mailto:${inst.email}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#ff7a00] text-[#ff7a00] hover:bg-[#ff7a00] hover:text-white transition"
            >
              <Mail size={18} /> Email
            </a>

            {inst.websiteLink && inst.websiteLink !== "na" && (
              <a
                href={inst.websiteLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl border"
              >
                <Globe size={18} /> Website
              </a>
            )}
          </div>
        </div>

        {/* 🗺️ MAP */}
        <div className="w-full h-[300px] rounded-2xl overflow-hidden border">
          <iframe
            title="Institute Location"
            src={mapSrc}
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      </div>

      {/* 📘 DETAILS */}
      <div className="grid md:grid-cols-2 gap-10 mt-12">
        <Section icon={Building2} title="About Institute">
          {inst.aboutUs || inst.description}
        </Section>

        <Section icon={Award} title="Achievements">
          {inst.achievements || "—"}
        </Section>

        <Section icon={Calendar} title="Founded">
          {inst.yearFounded}
        </Section>

        <Section icon={Users} title="Students">
          {inst.studentsCount}
        </Section>

        <Section icon={UserCheck} title="Trainers">
          {inst.trainersCount}
        </Section>

        <Section title="Facilities">{inst.facilities}</Section>
      </div>

      {/* 🧩 CATEGORIES */}
      <div className="mt-14">
        <h2 className="text-3xl font-bold text-[#ff7a00] mb-6">
          Categories & Programs
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(inst.categories || {}).map(([cat, subs]) => (
            <div
              key={cat}
              className="border rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg mb-2">{cat}</h3>
              <ul className="list-disc ml-5 text-gray-700">
                {subs.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* 🔹 Reusable Section */
const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-50 p-6 rounded-2xl">
    <h2 className="flex items-center gap-2 text-xl font-bold text-[#ff7a00] mb-2">
      {Icon && <Icon size={20} />} {title}
    </h2>
    <p className="text-gray-700 leading-relaxed">{children}</p>
  </div>
);
