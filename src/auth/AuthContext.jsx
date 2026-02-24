import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    localStorage.getItem("token") ? true : null
  );

  const login = async (username, password) => {
    const res = await api.post("/auth/login", {
      username,
      password,
    });

    localStorage.setItem("token", res.data.token);
    setUser(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
