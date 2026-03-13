import { useState } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import { useLogoutUser } from "../hooks/useAuth";

export const Context = createContext();
export const ContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const logingOut = useLogoutUser();
  const storeData = ({ user, token }) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    setUser(user);
    setToken(token);
  };
  const logout = async () => {
    await logingOut.mutate();

    navigate("/login");
  };
  return (
    <Context.Provider value={{ user, token, storeData, logout }}>
      {children}
    </Context.Provider>
  );
};
