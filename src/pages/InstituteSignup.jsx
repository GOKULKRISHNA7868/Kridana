// src/pages/InstituteSignup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit2 } from "lucide-react"; // npm install lucide-react
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";

export default function InstituteSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1, 2, or 3
  const role = "institute";
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1
    instituteName: "",
    locationName: "",
    latitude: "",
    longitude: "",
    yearFounded: "",
    phoneNumber: "",
    email: "",
    licenseNumber: "",
    certification: "",
    password: "",
    confirmPassword: "",
    // Step 2
    address: "",
    zipCode: "",
    city: "",
    state: "",
    websiteLink: "",
    // Step 3
    firstName: "",
    lastName: "",
    designation: "",
    measurements: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);
      setProfileImageFile(file);
    }
  };

  // Validation for each step
  const validateStep = () => {
    if (step === 1) {
      if (
        !formData.instituteName ||
        !formData.yearFounded ||
        !formData.phoneNumber ||
        !formData.email ||
        !formData.licenseNumber ||
        !formData.certification ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        alert("Please fill all fields in Step 1");
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        alert("Please enter a valid email");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return false;
      }

      if (formData.password.length < 6) {
        alert("Password must be at least 6 characters");
        return false;
      }

      return true;
    }

    if (step === 2) {
      if (
        !formData.address ||
        !formData.zipCode ||
        !formData.city ||
        !formData.state
      ) {
        alert("Please fill all required address fields");
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.designation ||
        !formData.measurements
      ) {
        alert("Please fill all management fields");
        return false;
      }
      return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      // 1️⃣ Create Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const uid = userCredential.user.uid;

      // 2️⃣ Upload profile image (optional)
      let profileImageUrl = "";
      if (profileImageFile) {
        const imageRef = ref(storage, `institutes/${uid}/profile.jpg`);
        await uploadBytes(imageRef, profileImageFile);
        profileImageUrl = await getDownloadURL(imageRef);
      }

      // 3️⃣ Save Institute data
      await setDoc(doc(db, "institutes", uid), {
        role: "institute",
        status: "pending",

        instituteName: formData.instituteName,
        yearFounded: formData.yearFounded,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        licenseNumber: formData.licenseNumber,
        certification: formData.certification,

        address: formData.address,
        zipCode: formData.zipCode,
        city: formData.city,
        state: formData.state,
        websiteLink: formData.websiteLink || "",

        firstName: formData.firstName,
        lastName: formData.lastName,
        designation: formData.designation,
        measurements: formData.measurements,

        profileImageUrl,

        // ✅ New location fields
        locationName: formData.locationName,
        latitude: formData.latitude,
        longitude: formData.longitude,

        createdAt: serverTimestamp(),
      });
      alert("Institute registered successfully!");
      navigate("/institute");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // Progress bar width
  const progressPercentage = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Step 0{step}</h2>
          </div>
          <button
            onClick={() => navigate("/login?role=institute")}
            className="mt-10 text-orange-400 underline text-lg font-bold transition-transform duration-300 hover:scale-105 hover:text-orange-500"
          >
            Institute Sign In
          </button>

          <button
            onClick={() => navigate("/institute")}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              {/* Profile section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover bg-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-300" />
                  )}
                </div>

                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 border-2 border-orange-500 text-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 transition">
                      <Edit2 size={18} />
                      <span>Change profile</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    className="border-2 border-gray-300 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                    onClick={() => {
                      setProfileImage(null);
                      setProfileImageFile(null);
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Institute name directly after profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block mb-2 text-gray-900 font-semibold">
                    Institute Name*
                  </label>
                  <input
                    type="text"
                    name="instituteName"
                    placeholder="Enter Institute Name"
                    value={formData.instituteName}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
                <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 pb-2">
                    Institute Location
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-gray-900 font-semibold">
                        Location Name*
                      </label>
                      <input
                        type="text"
                        name="locationName"
                        placeholder="Enter Location Name"
                        value={formData.locationName}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-900 font-semibold">
                        Latitude*
                      </label>
                      <input
                        type="text"
                        name="latitude"
                        placeholder="Enter Latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-900 font-semibold">
                        Longitude*
                      </label>
                      <input
                        type="text"
                        name="longitude"
                        placeholder="Enter Longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!navigator.geolocation) {
                        alert("Geolocation is not supported by your browser");
                        return;
                      }

                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          const { latitude, longitude } = position.coords;
                          setFormData((prev) => ({
                            ...prev,
                            latitude: latitude.toString(),
                            longitude: longitude.toString(),
                          }));

                          // Reverse geocoding using OpenStreetMap
                          try {
                            const response = await fetch(
                              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                            );
                            const data = await response.json();
                            setFormData((prev) => ({
                              ...prev,
                              locationName: data.display_name || "",
                            }));
                          } catch (err) {
                            console.error(
                              "Failed to fetch location name:",
                              err
                            );
                          }
                        },
                        (error) => {
                          alert(
                            "Could not fetch location. Please enter manually."
                          );
                          console.error(error);
                        }
                      );
                    }}
                    className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                  >
                    Fetch Current Location
                  </button>
                </div>

                <div>
                  <label className="block mb-2 text-gray-900 font-semibold">
                    Year Founded*
                  </label>
                  <input
                    type="number"
                    name="yearFounded"
                    placeholder="e.g. 2020"
                    value={formData.yearFounded}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-900 font-semibold">
                    Phone number*
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Enter Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-900 font-semibold">
                    E-Mail I'd*
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-900 font-semibold">
                    License Number*
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    placeholder="Enter License Number"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-900 font-semibold">
                    Certification*
                  </label>
                  <input
                    type="text"
                    name="certification"
                    placeholder="Enter Certification"
                    value={formData.certification}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-gray-900 font-semibold">
                  Password*
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-900 font-semibold">
                  Confirm Password*
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              <h3 className="text-xl font-bold text-gray-900 pb-2">
                Add Address
              </h3>

              <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-gray-900 font-semibold">
                      Address*
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter Street Address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-gray-900 font-semibold">
                      Zip code*
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="Enter Zip Code"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-gray-900 font-semibold">
                      City*
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter City"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-gray-900 font-semibold">
                      State*
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Enter State"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-gray-900 font-semibold">
                    Website link
                  </label>
                  <input
                    type="url"
                    name="websiteLink"
                    placeholder="Enter Website Link (Optional)"
                    value={formData.websiteLink}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <h3 className="text-xl font-bold text-gray-900 pb-2">
                Add Management Details
              </h3>

              <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-gray-900 font-semibold">
                      First Name*
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Enter First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-gray-900 font-semibold">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Enter Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-gray-900 font-semibold">
                      Designation Details*
                    </label>
                    <input
                      type="text"
                      name="designation"
                      placeholder="Enter Designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-gray-900 font-semibold">
                      Measurements*
                    </label>
                    <input
                      type="text"
                      name="measurements"
                      placeholder="Enter Measurements"
                      value={formData.measurements}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-8 border-t border-gray-200">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Previous
              </button>
            )}

            {step < 3 && (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-orange-500 text-white p-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Next
              </button>
            )}

            {step === 3 && (
              <button
                type="submit"
                className="flex-1 bg-orange-500 text-white p-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Save
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
