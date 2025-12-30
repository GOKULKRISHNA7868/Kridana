// src/pages/TrainerDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Star,
  Award,
  Calendar,
  Users,
  UserCheck,
  Building2,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";

export default function TrainerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);

  useEffect(() => {
    const loadTrainer = async () => {
      const snap = await getDoc(doc(db, "trainers", id));
      if (snap.exists()) setTrainer({ id: snap.id, ...snap.data() });
    };
    loadTrainer();
  }, [id]);
  useEffect(() => {
    const auth = getAuth();
    if (!auth.currentUser) {
      navigate("/login");
    }
  }, []);

  const handleRating = async (star) => {
    const user = auth.currentUser;
    if (!user || !trainer) return;

    const ratings = trainer.ratingsByUser || {};

    // ✅ Only one rating per user
    if (ratings[user.uid] !== undefined) {
      alert("You have already submitted your review.");
      return;
    }

    const count = trainer.ratingCount || 0;
    const avg = trainer.rating || 0;
    const newAvg = (avg * count + star) / (count + 1);

    await updateDoc(doc(db, "trainers", id), {
      rating: newAvg,
      ratingCount: count + 1,
      [`ratingsByUser.${user.uid}`]: star,
    });

    setTrainer((prev) => ({
      ...prev,
      rating: newAvg,
      ratingCount: count + 1,
      ratingsByUser: { ...ratings, [user.uid]: star },
    }));
  };

  if (!trainer) return null;

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    trainer.address || `${trainer.latitude},${trainer.longitude}`
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
        <ArrowLeft size={20} /> Back to Trainers
      </button>

      {/* 🧑 Trainer Header */}
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h1 className="text-4xl font-bold text-[#ff7a00]">
            {trainer.trainerName || `${trainer.firstName} ${trainer.lastName}`}
          </h1>

          <p className="flex items-center gap-2 text-gray-600 mt-3">
            <MapPin size={18} /> {trainer.address}, {trainer.city},{" "}
            {trainer.state}
          </p>

          {/* ⭐ Rating */}
          <div className="flex gap-2 my-4 items-center">
            {[1, 2, 3, 4, 5].map((s) => {
              const alreadyRated =
                trainer.ratingsByUser?.[auth.currentUser?.uid] !== undefined;
              return (
                <span
                  key={s}
                  onClick={() => !alreadyRated && handleRating(s)}
                  className={`text-3xl transition ${
                    trainer.ratingsByUser?.[auth.currentUser?.uid] >= s
                      ? "text-yellow-400 scale-110"
                      : "text-gray-300"
                  } ${
                    alreadyRated
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  }`}
                >
                  <Star />
                </span>
              );
            })}
            <span className="ml-2 font-semibold text-gray-700">
              {trainer.rating ? trainer.rating.toFixed(1) : "No ratings"}{" "}
              {trainer.ratingCount ? `(${trainer.ratingCount})` : ""}
            </span>
          </div>

          {/* 📞 CONTACT BUTTONS */}
          <div className="flex flex-wrap gap-4 mt-6">
            {trainer.phoneNumber && (
              <a
                href={`tel:${trainer.phoneNumber}`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ff7a00] text-white hover:scale-105 transition"
              >
                <Phone size={18} /> Call
              </a>
            )}

            {trainer.email && (
              <a
                href={`mailto:${trainer.email}`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#ff7a00] text-[#ff7a00] hover:bg-[#ff7a00] hover:text-white transition"
              >
                <Mail size={18} /> Email
              </a>
            )}

            {trainer.websiteLink && trainer.websiteLink !== "na" && (
              <a
                href={trainer.websiteLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl border hover:shadow-md transition"
              >
                <Globe size={18} /> Website
              </a>
            )}
          </div>
        </div>

        {/* 🗺️ MAP */}
        <div className="w-full h-[300px] rounded-2xl overflow-hidden border shadow-sm">
          <iframe
            title="Trainer Location"
            src={mapSrc}
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      </div>

      {/* 📘 DETAILS */}
      <div className="grid md:grid-cols-2 gap-10 mt-12">
        <Section icon={Building2} title="About Trainer">
          {trainer.about || trainer.description || "—"}
        </Section>

        <Section icon={Award} title="Achievements">
          {trainer.achievements || "—"}
        </Section>

        <Section icon={Calendar} title="Experience">
          {trainer.yearsExperience || trainer.experience || "—"} years
        </Section>

        <Section icon={Users} title="Categories">
          {(trainer.categories || []).join(", ") || "—"}
        </Section>

        <Section icon={UserCheck} title="Sub Categories">
          {trainer.subCategories
            ? Object.entries(trainer.subCategories)
                .map(([cat, subs]) => `${cat}: ${subs.join(", ")}`)
                .join(" | ")
            : "—"}
        </Section>

        <Section title="Facilities">{trainer.facilities || "—"}</Section>
      </div>
    </motion.div>
  );
}

/* 🔹 Reusable Section Component */
const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
    <h2 className="flex items-center gap-2 text-xl font-bold text-[#ff7a00] mb-2">
      {Icon && <Icon size={20} />} {title}
    </h2>
    <p className="text-gray-700 leading-relaxed">{children}</p>
  </div>
);
