import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { useNavigate } from "react-router-dom";
const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const services = ["Martial Arts", "Team Ball Sports", "Racket Sports"];

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const navigate = useNavigate();
  const [topTrainers, setTopTrainers] = useState([]);
  const [topInstitutes, setTopInstitutes] = useState([]);
  const [mode, setMode] = useState("top"); // top | nearby
  const [userLocation, setUserLocation] = useState(null);
  const serviceRoutes = {
    "Martial Arts": "/services/martial-arts",
    "Team Ball Sports": "/services/Teamball",
    "Racket Sports": "/services/RacketSports",
  };

  // 🔹 Fetch user's current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setUserLocation(null)
    );
  }, []);
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Fetch Trainers
  const fetchTrainers = async () => {
    const q = query(collection(db, "trainers"), orderBy("rating", "desc"));
    const snap = await getDocs(q);
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (mode === "nearby" && userLocation) {
      data = data
        .filter((t) => t.latitude && t.longitude)
        .map((t) => ({
          ...t,
          distance: getDistance(
            userLocation.lat,
            userLocation.lng,
            parseFloat(t.latitude),
            parseFloat(t.longitude)
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
    } else {
      data = data.slice(0, 3);
    }

    setTopTrainers(data);
  };

  // 🔹 Fetch Institutes
  const fetchInstitutes = async () => {
    const q = query(collection(db, "institutes"));
    const snap = await getDocs(q);

    let data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    if (mode === "nearby" && userLocation) {
      data = data
        .filter(
          (i) =>
            i.latitude &&
            i.longitude &&
            !isNaN(parseFloat(i.latitude)) &&
            !isNaN(parseFloat(i.longitude))
        )
        .map((i) => ({
          ...i,
          distance: getDistance(
            userLocation.lat,
            userLocation.lng,
            parseFloat(i.latitude),
            parseFloat(i.longitude)
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
    } else {
      data = data.slice(0, 3);
    }

    setTopInstitutes(data);
  };

  useEffect(() => {
    fetchTrainers();
    fetchInstitutes();
  }, [mode, userLocation]);

  return (
    <div className="w-full font-sans">
      {/* HERO SECTION */}
      <section className="bg-gray-50 p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
        <div className="max-w-lg text-center md:text-left z-10">
          <h1 className="text-4xl font-bold text-orange-600 mb-4">
            Rise. Play. Conquer
          </h1>
          <p className="text-gray-700 mb-4">
            Turn your passion into power with expert coaching and guided sports
            training
          </p>
          <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition">
            Sign Up
          </button>
        </div>

        <div className="flex gap-2 h-80 overflow-hidden">
          <div className="flex flex-col gap-2 animate-scroll-up">
            <img
              src="/images/job.png"
              className="w-32 md:w-40 h-20 object-cover rounded-lg"
            />
            <img
              src="/images/job1.png"
              className="w-32 md:w-40 h-20 object-cover rounded-lg"
            />
            <img
              src="/images/job2.png"
              className="w-32 md:w-40 h-20 object-cover rounded-lg"
            />
          </div>
          <div className="flex flex-col gap-2 animate-scroll-down">
            <img
              src="/images/job1.png"
              className="w-32 md:w-40 h-20 object-cover rounded-lg"
            />
            <img
              src="/images/job.png"
              className="w-32 md:w-40 h-20 object-cover rounded-lg"
            />
            <img
              src="/images/job2.png"
              className="w-32 md:w-40 h-20 object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-12 px-6 md:px-16 bg-white">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center md:text-left">
          Services
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              onClick={() => navigate(serviceRoutes[service])}
              className="h-40 bg-orange-500 rounded-lg flex items-center justify-center text-white text-lg font-semibold shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              {service}
            </motion.div>
          ))}
        </div>
      </section>

      {/* TOP TRAINERS */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setMode("top")}
          className={`px-4 py-2 rounded-lg ${
            mode === "top" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Top Rated
        </button>
        <button
          onClick={() => setMode("nearby")}
          className={`px-4 py-2 rounded-lg ${
            mode === "nearby" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Near Me
        </button>
      </div>

      {/* ===== TOP TRAINERS ===== */}
      <section className="py-12 px-6 md:px-16 bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          Top Trainers
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {topTrainers.map((t) => (
            <motion.div
              key={t.id}
              onClick={() => {
                if (!user) {
                  setShowAuthPopup(true);
                  return;
                }
                navigate(`/trainers/${t.id}`);
              }}
              className="bg-white p-4 rounded-lg shadow hover:scale-105 transition cursor-pointer"
            >
              <h3 className="font-semibold">
                {t.firstName} {t.lastName}
              </h3>
              <p className="text-sm">{t.city}</p>
              <p className="text-sm">⭐ {t.rating}</p>
              {t.distance && (
                <p className="text-xs text-gray-500">
                  {t.distance.toFixed(1)} km away
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== TOP INSTITUTES ===== */}
      <section className="py-12 px-6 md:px-16 bg-white">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          Top Institutes
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {topInstitutes.map((i) => (
            <motion.div
              key={i.id}
              onClick={() => {
                if (!user) {
                  setShowAuthPopup(true);
                  return;
                }
                navigate(`/institutes/${i.id}`);
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg shadow hover:scale-105 transition cursor-pointer"
            >
              <h3 className="font-semibold">{i.instituteName}</h3>
              <p className="text-sm">{i.state}</p>
              <p className="text-sm">⭐ {i.rating}</p>
              {i.distance && (
                <p className="text-xs text-gray-500">
                  {i.distance.toFixed(1)} km away
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </section>
      {showAuthPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 text-center shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Login Required</h2>
            <p className="text-sm text-gray-600 mb-4">
              Please login or create an account to continue.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-orange-500 text-white rounded"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 border rounded"
              >
                Sign Up
              </button>
            </div>

            <button
              onClick={() => setShowAuthPopup(false)}
              className="mt-3 text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
