import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");
    return role ? { role, name } : null;
  });

  const login = (data) => {
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);
    setUser({ role: data.role, name: data.name });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);