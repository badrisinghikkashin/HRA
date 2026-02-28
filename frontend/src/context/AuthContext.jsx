import React, { createContext, useContext, useState, useCallback } from "react";
import { loginUser } from "../lib/api/authApi";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("hra_user");
      if (!stored || stored === "undefined") {
        return null;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      localStorage.removeItem("hra_user");
      return null;
    }
  });

  const login = useCallback(async (employeeId, password) => {
    try {
      const res = await loginUser({ employeeId, password });

      // Backend returns: { message, token, role, employeeId }
      const { token, role, employeeId: empId } = res.data;

      // Construct user object
      const userData = {
        employeeId: empId,
        role: role.toLowerCase(), // Convert to lowercase for consistency
        token,
      };

      setUser(userData);
      localStorage.setItem("hra_user", JSON.stringify(userData));
      localStorage.setItem("hra_token", token);

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("hra_user");
    localStorage.removeItem("hra_token");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};