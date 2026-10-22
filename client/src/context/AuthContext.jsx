import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch((error) => {
        if (error.response?.status !== 401) console.error("Unable to restore session:", error);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      const { data } = await api.post("/auth/login", credentials);
      setUser(data.user);
      return data.user;
    },
    async register(details) {
      const { data } = await api.post("/auth/register", details);
      setUser(data.user);
      return data.user;
    },
    async logout() {
      await api.post("/auth/logout");
      setUser(null);
    },
    updateUser(nextUser) {
      setUser(nextUser);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
