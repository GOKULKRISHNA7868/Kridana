// src/pages/ViewInstitutes.jsx
import React, { useEffect, useState, useMemo } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

export default function ViewInstitutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read query param for category
  const searchParams = new URLSearchParams(location.search);
  const defaultCategory = searchParams.get("category") || "";

  const [category, setCategory] = useState(defaultCategory);
  const [subCategory, setSubCategory] = useState("");
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDocs(collection(db, "institutes"));
      setInstitutes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredInstitutes = useMemo(() => {
    return institutes.filter((i) => {
      // Normalize categories to array
      let cats = [];
      if (Array.isArray(i.categories)) {
        cats = i.categories;
      } else if (i.categories && typeof i.categories === "object") {
        cats = Object.keys(i.categories);
      }

      if (category && !cats.includes(category)) return false;

      // Subcategory filter
      let subCats = [];
      if (category && i.subCategories?.[category]) {
        subCats = i.subCategories[category];
      }

      if (subCategory && !subCats.includes(subCategory)) return false;

      // City filter
      if (city && i.city !== city) return false;

      // Minimum rating
      if (minRating && (i.rating || 0) < Number(minRating)) return false;

      return true;
    });
  }, [institutes, category, subCategory, city, minRating]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Institutes...
      </div>
    );

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-12">
      <h1 className="text-4xl font-bold text-[#ff7a00] mb-8">Institutes</h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {/* Category */}
        <select
          className="border p-3 rounded"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubCategory("");
          }}
        >
          <option value="">All Categories</option>
          {institutes
            .flatMap((i) =>
              i.categories && typeof i.categories === "object"
                ? Object.keys(i.categories)
                : []
            )
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </select>

        {/* Subcategory */}
        <select
          className="border p-3 rounded"
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
        >
          <option value="">All Subcategories</option>
          {category &&
            institutes
              .flatMap((i) => i.subCategories?.[category] || [])
              .filter((v, i, a) => a.indexOf(v) === i)
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
        </select>

        {/* City */}
        <select
          className="border p-3 rounded"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">All Cities</option>
          {[...new Set(institutes.map((i) => i.city))].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Min Rating */}
        <select
          className="border p-3 rounded"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
        >
          <option value="">Any Rating</option>
          <option value="3">3★+</option>
          <option value="4">4★+</option>
        </select>
      </div>

      {/* LIST */}
      {filteredInstitutes.length === 0 ? (
        <p className="text-center text-gray-500 text-xl mt-12">
          No institutes found for the selected filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredInstitutes.map((inst) => (
            <div
              key={inst.id}
              onClick={() => navigate(`/institutes/${inst.id}`)}
              className="bg-white rounded-xl shadow-lg border cursor-pointer hover:scale-[1.02] transition"
            >
              <div className="h-[220px] bg-gray-200" />

              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold">{inst.instituteName}</h2>
                <p className="text-gray-500">
                  {inst.city}, {inst.state}
                </p>
                <p className="font-semibold mt-1">
                  ⭐ {inst.rating ? inst.rating.toFixed(1) : "No ratings"}
                </p>
                <p className="mt-1 text-gray-600">
                  Categories:{" "}
                  {inst.categories
                    ? Object.keys(inst.categories).join(", ")
                    : "N/A"}
                </p>
                <button className="mt-4 w-full bg-[#ff7a00] text-white py-3 rounded-xl">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
