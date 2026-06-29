import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService } from "../main"; //This is the backend auth service. We connect to it using a proxy in vite.config.ts. This is done to avoid CORS issues. The proxy will forward the request to the backend auth service.

import type { AppContextType, User } from "../types";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching Location...");

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${authService}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("========== BACKEND RESPONSE ==========");
      console.log(data);
      console.log("=====================================");

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider
      value={{ user, setUser, isAuth, setIsAuth, loading, setLoading }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppProvider");
  }
  return context;
};

//useAppData is a custom hook that allows you to access the AppContext. It throws an error if used outside of the AppProvider, ensuring that the context is always available when needed.

//AppProvider is a component that wraps your application and provides the AppContext to all child components. It manages the user state, authentication status, and loading state, and fetches the user data from the backend when the component mounts.
