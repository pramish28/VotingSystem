import React, { createContext, useState, useEffect, useContext } from "react";
import api from "./api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reusable: refresh user profile from server
  const fetchMe = async () => {
    const { data } = await api.get("/api/auth/me"); // guaranteed route in your backend
    return data; // full profile (no password)
  };

  useEffect(() => {
    let alive = true;

    const token = localStorage.getItem("token");
    const cachedUserStr = localStorage.getItem("user");

    // 1) Show cached user immediately (so header can display a name)
    if (cachedUserStr) {
      try {
        const cached = JSON.parse(cachedUserStr);
        setUser(cached);
      } catch {
        // ignore JSON parse errors; we'll refresh below
      }
    }

    // 2) If there is no token, we're done
    if (!token) {
      setLoading(false);
      return;
    }

    // 3) Refresh profile in the background
    (async () => {
      try {
        const me = await fetchMe();
        if (!alive) return;
        setUser(me);
        localStorage.setItem("user", JSON.stringify(me));
      } catch (err) {
        if (!alive) return;
        // token likely invalid/expired → clear everything
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const login = async (email, password) => {
    // 1) Login to get token
    const response = await api.post("/api/auth/login", { email, password });
    const { token } = response.data;

    // 2) Store token first so the next request has Authorization
    localStorage.setItem("token", token);

    // 3) Fetch full profile (authoritative) and cache it
    try {
      const me = await api.get("/api/auth/me");
      const fullUser = me.data;
      localStorage.setItem("user", JSON.stringify(fullUser));
      setUser(fullUser);
      return fullUser;
    } catch {
      // Fallback: if /me fails for some reason, keep minimal login payload
      const minimalUser = response.data.user || null;
      if (minimalUser) {
        localStorage.setItem("user", JSON.stringify(minimalUser));
        setUser(minimalUser);
        return minimalUser;
      }
      // If we can't get anything, clear and throw
      localStorage.removeItem("token");
      throw new Error("Login succeeded but profile fetch failed.");
    }
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
