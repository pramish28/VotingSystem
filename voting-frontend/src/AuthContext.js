// import React, { createContext, useState, useEffect, useContext } from "react";
// import api from "./api";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const localUser = localStorage.getItem("user");
//     console.log("Checking auth, token:", token);
//     if (token) {
//       api
//         .get("/api/auth/me")
//         .then((res) => {
//           console.log("User fetched from /me:", res.data);
//           setUser(res.data);
//         })
//         .catch(() => {
//           if (localUser) {
//             setUser(JSON.parse(localUser)); //fallback
//           } else {
//             localStorage.removeItem("token");
//             setUser(null);
//           }

//           setUser(null);
//         })
//         .finally(() => setLoading(false));
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const login = async (email, password) => {
//     const response = await api.post("/api/auth/login", { email, password });
//     const { token, user } = response.data;
//     localStorage.setItem("token", token);
//     setUser(user);
//     return user;
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

import React, { createContext, useState, useEffect, useContext } from "react";
import api from "./api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const token = localStorage.getItem("token");
    const localUserStr = localStorage.getItem("user");

    // Optimistic hydrate from localStorage
    if (localUserStr) {
      try { setUser(JSON.parse(localUserStr)); } catch {}
    }

    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // Use the route you definitely have
        const { data } = await api.get("/api/user/profile");
        if (!alive) return;
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        if (!alive) return;
        // If we had no fallback, clear auth
        if (!localUserStr) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
