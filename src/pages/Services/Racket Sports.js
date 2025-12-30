import React from "react";
import { Search, Users, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Racket = () => {
  const navigate = useNavigate();

  const categories = [
    "Tennis",
    "Badminton",
    "Pickleball",
    "Soft Tennis",
    "Padel Tennis",
    "Speedminton",
  ];

  const handleViewTrainers = () => {
    navigate("/viewTrainers?category=Racket");
  };

  const handleViewInstitutes = () => {
    navigate("/viewInstitutes?category=Racket");
  };

  return (
    <div className="font-sans bg-gray-50 text-gray-800">
      {/* ================= HERO SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          Master the Court
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          Sharpen your focus, power, and passion with dynamic racket sports.
        </p>

        {/* Hero Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <button
            onClick={handleViewTrainers}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition"
          >
            <Users size={18} /> View Trainers
          </button>

          <button
            onClick={handleViewInstitutes}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition"
          >
            <Building2 size={18} /> View Institutes
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search for Institutes and Trainers"
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </section>

      {/* ================= RACKET SPORTS CATEGORIES ================= */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-orange-600 mb-12 text-center">
          Racket Sports
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {categories.map((item) => (
            <div
              key={item}
              className="bg-orange-500 rounded-xl p-6 text-white flex flex-col items-center text-center hover:scale-105 transition"
            >
              <div className="w-20 h-20 bg-white rounded-lg mb-4" />
              <h4 className="text-xl font-semibold mb-4">{item}</h4>
              <button
                onClick={() =>
                  navigate(`/viewTrainers?category=${encodeURIComponent(item)}`)
                }
                className="bg-white text-orange-600 px-5 py-2 rounded-full font-medium hover:bg-gray-100 transition"
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-4">How it Works</h3>
          <p className="text-gray-600 mb-12">
            Get started with your racket sports journey in three simple steps.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white rounded-xl p-8 shadow hover:shadow-lg transition">
              <div className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <Users />
              </div>
              <h4 className="font-bold text-lg mb-3">Find Your Trainers</h4>
              <p className="text-gray-600 mb-6">
                Discover certified coaches for your favorite racket sport.
              </p>
              <button
                onClick={handleViewTrainers}
                className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition"
              >
                View Trainers
              </button>
            </div>

            <div className="bg-white rounded-xl p-8 shadow hover:shadow-lg transition">
              <div className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 />
              </div>
              <h4 className="font-bold text-lg mb-3">Find Your Institutes</h4>
              <p className="text-gray-600 mb-6">
                Explore academies with professional racket training facilities.
              </p>
              <button
                onClick={handleViewInstitutes}
                className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition"
              >
                View Institutes
              </button>
            </div>

            <div className="bg-white rounded-xl p-8 shadow hover:shadow-lg transition">
              <div className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                ⚡
              </div>
              <h4 className="font-bold text-lg mb-3">Start Training</h4>
              <p className="text-gray-600 mb-6">
                Perfect your technique and dominate the court.
              </p>
              <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Racket;
