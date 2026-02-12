import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { getUser, setUser as storeUser, clearUser, getRegisteredUsers, registerUser, addWorker } from "@/lib/storage";

const ADMIN_PASSWORD = "BuildSync2026";

interface AuthContextType {
  user: User | null;
  loginAdmin: (name: string, password: string) => string | null;
  loginWorker: (email: string, password: string) => string | null;
  signupWorker: (name: string, email: string, phone: string, role: string, password: string) => string | null;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isWorker: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    setUserState(getUser());
  }, []);

  const loginAdmin = (name: string, password: string): string | null => {
    if (password !== ADMIN_PASSWORD) return "Invalid admin password";
    const u: User = { id: "admin-001", name: name.trim(), email: "admin@buildsync.com", role: "admin" };
    storeUser(u);
    setUserState(u);
    return null;
  };

  const loginWorker = (email: string, password: string): string | null => {
    const users = getRegisteredUsers();
    const found = users.find(u => u.email === email.trim().toLowerCase() && u.password === password);
    if (!found) return "Invalid email or password";
    const u: User = { id: found.id, name: found.name, email: found.email, role: "worker", phone: found.phone };
    storeUser(u);
    setUserState(u);
    return null;
  };

  const signupWorker = (name: string, email: string, phone: string, role: string, password: string): string | null => {
    const users = getRegisteredUsers();
    if (users.some(u => u.email === email.trim().toLowerCase())) return "Email already registered";
    const id = crypto.randomUUID();
    const u: User = { id, name: name.trim(), email: email.trim().toLowerCase(), role: "worker", phone, password };
    registerUser(u);
    addWorker({ id, name: name.trim(), role: role.trim(), phone, projectIds: [] });
    storeUser({ ...u, password: undefined });
    setUserState({ ...u, password: undefined });
    return null;
  };

  const logout = () => {
    clearUser();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loginAdmin,
      loginWorker,
      signupWorker,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isWorker: user?.role === "worker",
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
