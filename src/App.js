import { Routes, Route, useLocation } from "react-router-dom";

import RoleSelection from "./pages/RoleSelection";
import Signup from "./pages/Signup";
import TrainerSignup from "./pages/TrainerSignup";
import InstituteSignup from "./pages/InstituteSignup";
import ShopPage from "./components/ShopPage";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import InstituteDashboard from "./components/InstituteDashboard";
import TrainersDashboard from "./components/TrainersDashboard";
import ProtectedInstituteRoute from "./routes/ProtectedInstituteRoute";
import Teamball from "./pages/Services/Teamball";
import Fitness from "./pages/Services/Fitness";
import MartialArts from "./pages/Services/Martial-Arts";
import EquestrianSports from "./pages/Services/EquestrianSports";
import AdventureOutdoorSports from "./pages/Services/AdventureOutdoorSports";
import ViewInstitutes from "./pages/ViewInstitutes";
import ViewTrainers from "./pages/ViewTrainers";
import InstituteDetailsPage from "./pages/InstituteDetailsPage";
import TrainerDetailsPage from "./pages/TrainerDetailsPage";
import RacketSports from "./pages/Services/Racket Sports";
import UserDashboard from "./components/UserDashboard";
function App() {
  const location = useLocation();

  const hideNavbarPaths = [
    "/",
    "/login",
    "/signup",
    "/trainer-signup",
    "/institute-signup",
  ];

  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="bg-white text-black min-h-screen">
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trainer-signup" element={<TrainerSignup />} />
        <Route path="/institute-signup" element={<InstituteSignup />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/landing" element={<Landing />} />
        {/* Institute Dashboard */}
        <Route path="/institutes/dashboard" element={<InstituteDashboard />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        {/* Trainer Dashboard */}
        <Route path="/trainers/dashboard" element={<TrainersDashboard />} />
        <Route path="/services/fitness" element={<Fitness />} />
        <Route path="/services/martial-arts" element={<MartialArts />} />
        <Route
          path="/services/equestrian-sports"
          element={<EquestrianSports />}
        />
        <Route path="/services/racketsports" element={<RacketSports />} />
        <Route
          path="/services/adventure-outdoor-sports"
          element={<AdventureOutdoorSports />}
        />
        <Route path="/services/teamball" element={<Teamball />} />
        <Route path="ViewInstitutes" element={<ViewInstitutes />} />

        <Route path="/institutes/:id" element={<InstituteDetailsPage />} />
        <Route path="ViewTrainers" element={<ViewTrainers />} />
        <Route path="/trainers/:id" element={<TrainerDetailsPage />} />
      </Routes>
    </div>
  );
}

export default App;
