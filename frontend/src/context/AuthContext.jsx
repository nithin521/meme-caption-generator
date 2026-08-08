import { createContext, useContext, useState, useCallback } from "react";
import { loginUser, registerUser } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const persist = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({ username: data.username, userId: data.userId }));
    setUser({ username: data.username, userId: data.userId });
  };

  const login = useCallback(async (username, password) => {
    const res = await loginUser({ username, password });
    persist(res.data);
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await registerUser({ username, email, password });
    persist(res.data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
