// src/components/ShopPage.jsx
import React, { useEffect, useState } from "react";

const categories = [
  { id: 1, title: "Upper Wear", image: "/upperwear.jpg" },
  { id: 2, title: "Bottom Wear", image: "/bottomwear.jpg" },
  { id: 3, title: "GYM", image: "/gym.jpg" },
  { id: 4, title: "Head wear", image: "/headwear.jpg" },
  { id: 5, title: "Sports Equipment", image: "/sportsequipment.jpg" },
];

const recommended = [
  {
    id: 1,
    name: "Shoes",
    price: 30000,
    images: [
      "https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
    ],
    colors: ["#e98f97ff", "#80888fff", "#2146cbff"],
  },
  {
    id: 2,
    name: "T-Shirt",
    price: 30000,
    images: ["/tshirt-1.jpg", "/tshirt-2.jpg", "/tshirt-3.jpg"],
    colors: ["#6d909bff", "#111827", "#051c5dff"],
  },
  {
    id: 3,
    name: "Head wear",
    price: 30000,
    images: ["/headwear-1.jpg", "/headwear-2.jpg", "/headwear-3.jpg"],
    colors: ["#F97316", "#111827", "#E5E7EB"],
  },
];

const ShopPage = () => {
  const [view, setView] = useState("home"); // 'home' or 'grid'

  if (view === "grid") {
    return <ProductsGrid onBack={() => setView("home")} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 1) Full hero image */}
      <div className="w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[480px] overflow-hidden">
        <img src="/shop.jpg" alt="Store" className="w-full h-full object-cover" />
      </div>

      {/* 2) Category cards row */}
      <section className="max-w-6xl mx-auto px-4 -mt-12 sm:-mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg px-4 py-5 sm:px-6 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="relative rounded-xl overflow-hidden h-28 sm:h-32 lg:h-36 group"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                <span className="absolute inset-0 flex items-center justify-start pl-6 text-white font-semibold text-lg sm:text-xl">
                  {cat.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3) Recommended section with slider */}
      <section className="max-w-6xl mx-auto px-4 mt-10 mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-orange-500 mb-6">
          Recommended
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommended.map((item) => (
            <RecommendedCard
              key={item.id}
              item={item}
              onOpenGrid={() => setView("grid")}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

const RecommendedCard = ({ item, onOpenGrid }) => {
  const [index, setIndex] = useState(0);

  // auto-slide every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % item.images.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [item.images.length]);

  const slideWidth = 100 / item.images.length;

  return (
    <div className="bg-white rounded-[32px] shadow-md border border-gray-100 overflow-hidden flex flex-col">
      {/* image area */}
      <div className="px-6 pt-6 pb-4">
        <div className="bg-gray-50 rounded-[32px] overflow-hidden relative h-64">
          <div
            className="absolute inset-0 flex slide-track"
            style={{
              width: `${item.images.length * 100}%`,
              transform: `translateX(-${index * slideWidth}%)`,
            }}
          >
            {item.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={item.name}
                className="h-64 object-cover flex-shrink-0"
                style={{ width: `${slideWidth}%` }}
              />
            ))}
          </div>
        </div>

        {/* slider bars */}
        <div className="flex items-center justify-center gap-3 mt-4">
          {item.images.map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 rounded-full transition-all duration-300 " +
                (i === index ? "w-16 bg-orange-500" : "w-10 bg-gray-300")
              }
            />
          ))}
        </div>
      </div>

      {/* text + colors + price */}
      <div className="px-6 pb-6 mt-2 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-extrabold text-orange-500">
            {item.name}
          </h3>
          <button
            onClick={onOpenGrid}
            className="h-9 w-9 rounded-full border-2 border-orange-400 text-orange-400 flex items-center justify-center text-xl leading-none"
          >
            →
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {item.colors.map((c, idx) => (
              <span
                key={idx}
                className="h-5 w-5 rounded-md border border-gray-200"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <p className="text-xl font-bold text-gray-900">
            ₹ {item.price.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
};

/* grid page like your screenshot */
const ProductsGrid = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white flex">
      {/* left sidebar */}
      <aside className="w-72 bg-orange-100 p-6 space-y-6">
        <button onClick={onBack} className="mb-4 text-sm text-orange-600 underline">
          ← Back
        </button>

        <div>
          <h2 className="text-3xl font-extrabold text-orange-600 mb-4">
            Category
          </h2>
          <div className="space-y-3 text-lg">
            <div>Sale 50% off</div>
            <div>Men’s</div>
            <div>Woman’s</div>
            <div>Basket</div>
            <div>Sports ware</div>
          </div>
        </div>

        <div>
          <h3 className="mt-6 text-2xl font-extrabold text-orange-600">
            Filter By :
          </h3>
          <p className="mt-2 font-semibold">Price</p>
          <div className="mt-2 space-y-2 text-lg">
            <div>▢ 10 – 100</div>
            <div>▢ 100 – 1000</div>
            <div>▢ 1000 – 10,000</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-2xl font-extrabold text-orange-600 mb-3">
            Colors
          </h3>
          <div className="flex gap-2">
            <span className="w-8 h-8 bg-black" />
            <span className="w-8 h-8 bg-orange-500" />
            <span className="w-8 h-8 bg-red-500" />
            <span className="w-8 h-8 bg-lime-500" />
            <span className="w-8 h-8 bg-blue-500" />
            <span className="w-8 h-8 bg-purple-500" />
          </div>
        </div>
      </aside>

      {/* right content */}
      <main className="flex-1 p-6">
        {/* search + icons row */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2"
          />
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-xl">
            ♥
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-xl">
            🛒
          </div>
        </div>

        {/* products grid – placeholder cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="border border-orange-200 rounded-3xl overflow-hidden"
            >
              <div className="relative bg-gray-100 h-40">
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-orange-500 flex items-center justify-center">
                  ♥
                </button>
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-lg mb-1">Product name</h4>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="font-semibold">₹ 0000</p>
                  </div>
                  <button className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
                    ⊕ Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ShopPage;
