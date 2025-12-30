import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setInstitute(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      try {
        // 🔐 Fetch institute document using UID
        const instituteRef = doc(db, "institutes", firebaseUser.uid);
        const instituteSnap = await getDoc(instituteRef);

        if (instituteSnap.exists()) {
          setInstitute({
            id: instituteSnap.id,
            ...instituteSnap.data(),
          });
        } else {
          setInstitute(null);
        }
      } catch (error) {
        console.error("Failed to load institute data:", error);
        setInstitute(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, institute, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
