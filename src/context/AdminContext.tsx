import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import adminApi from "../utils/adminApi";

interface Admin {
  username: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AdminContextType {
  isAuthenticated: boolean;
  loading: boolean;
  admin: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; admin: string }>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [admin, setAdmin] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("adminToken");
      console.log("AdminContext: checkAuthStatus called, token:", token ? "Present" : "Missing");

      if (!token) {
        setIsAuthenticated(false);
        setAdmin(null);
        setLoading(false);
        return;
      }

      const res = await adminApi.get("/admin/verify");
      console.log("AdminContext: verify response:", res.data);

      if (res.data?.ok) {
        setIsAuthenticated(true);
        setAdmin(res.data.admin?.username || "admin");
      } else {
        setIsAuthenticated(false);
        setAdmin(null);
      }
    } catch (error) {
      console.error("AdminContext: checkAuthStatus error:", error);
      setIsAuthenticated(false);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; admin: string }> => {
    try {
      console.log("AdminContext: login called with credentials:", credentials);
      const res = await adminApi.post("/admin/login", credentials);
      console.log("AdminContext: login response:", res.data);

      const { access_token, admin: adminObj } = res.data;
      localStorage.setItem("adminToken", access_token);

      setIsAuthenticated(true);
      const adminName = adminObj?.username || credentials.username;
      setAdmin(adminName);

      return { success: true, admin: adminName };
    } catch (error: any) {
      console.error("AdminContext: login error:", error);
      throw new Error(error.response?.data?.detail || "Login failed");
    }
  };

  const logout = (): void => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setAdmin(null);
  };

  const value: AdminContextType = {
    isAuthenticated,
    loading,
    admin,
    login,
    logout,
    checkAuthStatus,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContext;
