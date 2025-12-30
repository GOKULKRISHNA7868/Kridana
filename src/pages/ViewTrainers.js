// src/pages/ViewTrainers.jsx
import React, { useEffect, useState, useMemo } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

/* 🌍 Distance Formula */
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function ViewTrainers() {
  const navigate = useNavigate();
  const location = useLocation();

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 📍 User location */
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

  /* 🔹 Filters */
  const searchParams = new URLSearchParams(location.search);
  const defaultCategory = searchParams.get("category") || ""; // e.g., "MartialArts"
  const [category, setCategory] = useState(defaultCategory);
  const [subCategory, setSubCategory] = useState("");
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState("");

  /* 🔐 Fetch trainers */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDocs(collection(db, "trainers"));
      setTrainers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* 📍 Get Current Location */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      },
      () => alert("Location access denied")
    );
  };

  /* 🔹 Filtered & Sorted Trainers */
  const filteredTrainers = useMemo(() => {
    return trainers
      .filter((t) => {
        // Category filter
        if (category && !t.categories?.includes(category)) return false;

        // Subcategory filter
        if (subCategory && !t.subCategories?.[category]?.includes(subCategory))
          return false;

        // City filter
        if (city && t.city !== city) return false;

        // Minimum rating filter
        if (minRating && (t.rating || 0) < Number(minRating)) return false;

        return true;
      })
      .map((t) => {
        const lat = userLat ?? Number(manualLat);
        const lng = userLng ?? Number(manualLng);
        if (!lat || !lng || !t.latitude || !t.longitude) return t;
        return {
          ...t,
          distance: getDistanceKm(
            lat,
            lng,
            Number(t.latitude),
            Number(t.longitude)
          ),
        };
      })
      .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
  }, [
    trainers,
    category,
    subCategory,
    city,
    minRating,
    userLat,
    userLng,
    manualLat,
    manualLng,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading Trainers...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white px-6 md:px-16 py-12">
      <h1 className="text-4xl font-bold text-[#ff7a00] mb-8">Trainers</h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
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
          {trainers
            .flatMap((t) => t.categories || [])
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
            trainers
              .flatMap((t) => t.subCategories?.[category] || [])
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
          {[...new Set(trainers.map((t) => t.city))].map((c) => (
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

        {/* Location */}
        <div className="flex gap-2">
          <button
            onClick={getCurrentLocation}
            className="bg-[#ff7a00] text-white px-5 py-3 rounded-xl"
          >
            📍 Current Location
          </button>
          <input
            type="number"
            placeholder="Lat"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            className="border px-4 py-3 rounded-xl w-[100px]"
          />
          <input
            type="number"
            placeholder="Lng"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            className="border px-4 py-3 rounded-xl w-[100px]"
          />
        </div>
      </div>

      {/* TRAINER LIST */}
      {filteredTrainers.length === 0 ? (
        <p className="text-center text-gray-500 text-xl mt-12">
          No trainers found for the selected filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrainers.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/trainers/${t.id}`)}
              className="bg-white rounded-[18px] shadow-lg border cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="h-[220px] bg-gray-200" />
              <div className="p-6 text-center">
                <h2 className="text-[26px] font-bold">
                  {t.trainerName || `${t.firstName} ${t.lastName}`}
                </h2>
                <p className="text-gray-500">
                  {t.city}, {t.state}
                </p>
                {t.distance !== undefined && (
                  <p className="font-semibold text-sm mt-1">
                    📏 {t.distance.toFixed(2)} km away
                  </p>
                )}
                <p className="font-semibold mt-2">
                  ⭐ {t.rating ? t.rating.toFixed(1) : "No ratings"}{" "}
                  {t.ratingCount ? `(${t.ratingCount})` : ""}
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
