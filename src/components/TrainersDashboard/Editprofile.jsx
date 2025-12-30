import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  Upload,
  Save,
  Plus,
  Trash2,
  Award,
  IndianRupee,
  Users,
  Clock,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";

/* ---------------- CATEGORY CONFIG ---------------- */
const CATEGORY_MAP = {
  MartialArts: ["Karate", "Taekwondo", "Kung Fu", "Judo", "Boxing"],
  Fitness: ["Gym", "Yoga", "Zumba", "CrossFit", "Aerobics"],
  "Equestrian Sports": ["Horse Riding", "Show Jumping", "Dressage"],
  "Adventure Outdoor Sports": ["Rock Climbing", "Trekking", "Rafting"],
  TeamBall: ["Football", "Cricket", "Basketball", "Volleyball"],
};

export default function TrainerEditProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    trainerName: "",
    profit: "",
    about: "",
    description: "",
    categories: [],
    subCategories: {},
    facilities: "",
    achievements: [""],
    studentsCount: "",
    experience: "",
    timings: "",
    website: "",
    phone: "",
    locationName: "",
  });

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.error("User not logged in");
      setLoading(false);
      return;
    }

    const fetchTrainer = async () => {
      try {
        const ref = doc(db, "trainers", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setForm((prev) => ({
            ...prev,
            ...snap.data(),
            achievements: snap.data().achievements || [""],
            categories: snap.data().categories || [],
            subCategories: snap.data().subCategories || {},
          }));
        }
      } catch (err) {
        console.error("Error fetching trainer:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainer();
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleCategory = (cat) => {
    setForm((prev) => {
      const exists = prev.categories.includes(cat);
      const updated = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];

      return {
        ...prev,
        categories: updated,
        subCategories: exists
          ? Object.fromEntries(
              Object.entries(prev.subCategories).filter(([k]) => k !== cat)
            )
          : prev.subCategories,
      };
    });
  };

  const toggleSubCategory = (cat, sub) => {
    setForm((prev) => {
      const current = prev.subCategories[cat] || [];
      const updated = current.includes(sub)
        ? current.filter((s) => s !== sub)
        : [...current, sub];

      return {
        ...prev,
        subCategories: { ...prev.subCategories, [cat]: updated },
      };
    });
  };

  const saveProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setSaving(true);
    await updateDoc(doc(db, "trainers", uid), {
      ...form,
      updatedAt: serverTimestamp(),
    });
    setSaving(false);
    alert("Profile Updated Successfully");
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!auth.currentUser)
    return <div className="p-6 text-red-500">Please login</div>;

  /* ---------------- UI ---------------- */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 text-white"
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 text-white">
        <IndianRupee className="text-green-400" />
        <h1 className="text-2xl font-bold text-orange-400">
          Edit Trainer Profile & Profit
        </h1>
      </div>

      {/* BASIC INFO */}
      <section className="grid md:grid-cols-2 gap-6 bg-[#3b2615] rounded-2xl p-6 shadow">
        <input
          name="trainerName"
          value={form.trainerName}
          onChange={handleChange}
          placeholder="Trainer Name"
          className="input bg-[#5a3d1c] text-white placeholder-gray-300 border border-[#6b4a2d] rounded-lg px-4 py-2"
        />
        <input
          name="profit"
          value={form.profit}
          onChange={handleChange}
          placeholder="Monthly Profit (₹)"
          className="input bg-[#5a3d1c] text-white placeholder-gray-300 border border-[#6b4a2d] rounded-lg px-4 py-2"
        />
        <input
          name="experience"
          value={form.experience}
          onChange={handleChange}
          placeholder="Years of Experience"
          className="input bg-[#5a3d1c] text-white placeholder-gray-300 border border-[#6b4a2d] rounded-lg px-4 py-2"
        />
        <input
          name="studentsCount"
          value={form.studentsCount}
          onChange={handleChange}
          placeholder="Total Students"
          className="input bg-[#5a3d1c] text-white placeholder-gray-300 border border-[#6b4a2d] rounded-lg px-4 py-2"
        />
      </section>

      {/* ABOUT */}
      <section className="bg-[#3b2615] p-6 rounded-2xl shadow space-y-4">
        <textarea
          name="about"
          value={form.about}
          onChange={handleChange}
          placeholder="About Trainer"
          className="textarea w-full bg-[#5a3d1c] text-white placeholder-gray-300 border border-[#6b4a2d] rounded-lg p-3"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Training Description"
          className="textarea w-full bg-[#5a3d1c] text-white placeholder-gray-300 border border-[#6b4a2d] rounded-lg p-3"
        />
      </section>

      {/* CATEGORIES */}
      <section className="bg-[#3b2615] p-6 rounded-2xl shadow">
        <h2 className="font-semibold mb-4 text-orange-400">
          Categories & Sub Categories
        </h2>

        {Object.keys(CATEGORY_MAP).map((cat) => (
          <div key={cat} className="mb-4">
            <label className="flex items-center gap-2 font-medium text-white">
              <input
                type="checkbox"
                checked={form.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              {cat}
            </label>

            {form.categories.includes(cat) && (
              <div className="ml-6 mt-2 flex flex-wrap gap-3">
                {CATEGORY_MAP[cat].map((sub) => (
                  <label
                    key={sub}
                    className="text-sm flex items-center gap-1 text-white"
                  >
                    <input
                      type="checkbox"
                      checked={(form.subCategories[cat] || []).includes(sub)}
                      onChange={() => toggleSubCategory(cat, sub)}
                    />
                    {sub}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* FACILITIES */}
      <section className="bg-[#3b2615] p-6 rounded-2xl shadow">
        <textarea
          name="facilities"
          value={form.facilities}
          onChange={handleChange}
          placeholder="Facilities Provided (Gym, Equipment, Parking...)"
          className="textarea w-full bg-[#5a3d1c] text-white placeholder-gray-300 border border-[#6b4a2d] rounded-lg p-3"
        />
      </section>

      {/* ACHIEVEMENTS */}
      <section className="bg-[#3b2615] p-6 rounded-2xl shadow">
        <h2 className="font-semibold flex items-center gap-2 text-orange-400">
          <Award /> Achievements
        </h2>

        {form.achievements.map((a, i) => (
          <div key={i} className="flex gap-2 mt-2">
            <input
              value={a}
              onChange={(e) => {
                const arr = [...form.achievements];
                arr[i] = e.target.value;
                setForm({ ...form, achievements: arr });
              }}
              className="input flex-1 bg-[#5a3d1c] text-white placeholder-gray-300 border border-[#6b4a2d] rounded-lg px-3 py-2"
            />
            <Trash2
              className="cursor-pointer text-red-500"
              onClick={() =>
                setForm({
                  ...form,
                  achievements: form.achievements.filter((_, idx) => idx !== i),
                })
              }
            />
          </div>
        ))}

        <button
          onClick={() =>
            setForm({ ...form, achievements: [...form.achievements, ""] })
          }
          className="mt-3 text-blue-400 flex items-center gap-1"
        >
          <Plus size={16} /> Add Achievement
        </button>
      </section>

      {/* TIMINGS & LOCATION */}
      <section className="grid md:grid-cols-2 gap-6 bg-[#3b2615] p-6 rounded-2xl shadow">
        <input
          name="timings"
          value={form.timings}
          onChange={handleChange}
          placeholder="Available Timings (6AM - 9PM)"
          className="input bg-[#5a3d1c] text-white placeholder-gray-300 border border-[#6b4a2d] rounded-lg px-4 py-2"
        />
        <div className="flex items-center gap-2 text-gray-300">
          <MapPin size={18} />
          {form.locationName}
        </div>
      </section>

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          onClick={saveProfile}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-green-700"
        >
          <Save />
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </motion.div>
  );
}
