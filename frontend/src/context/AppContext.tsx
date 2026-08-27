import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService } from "../main"; //This is the backend auth service. We connect to it using a proxy in vite.config.ts. This is done to avoid CORS issues. The proxy will forward the request to the backend auth service
import type { AppContextType, LocationData, User, ICart } from "../types";
import { restaurantService } from "../main";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true); //why true? because we are fetching the user data from the backend when the component mounts. Until the data is fetched, we want to show a loading state. Once the data is fetched, we set loading to false. This prevents the app from rendering before we know if the user is authenticated or not.

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching Location...");

  const fetchUser = async () => {
    try {
      console.log("===== fetchUser started ====="); //temp
      const token = localStorage.getItem("token");

      console.log("Token =", token); //temp
      if (!token) {
        setLoading(false);
        return;
      }

      console.log("Calling /me"); //temp

      const { data } = await axios.get(`${authService}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("========== BACKEND RESPONSE ==========");
      console.log(data);
      console.log("=====================================");

      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
      localStorage.removeItem("token");
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  const [cart, setCart] = useState<ICart[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [subTotal, setSubTotal] = useState(0);
  const [quantity, setQuantity] = useState(0);

  async function fetchCart() {
    if (!user || user.role !== "customer") {
      setLoadingCart(false);
      return;
    }
    try {
      setLoadingCart(true);
      const { data } = await axios.get(`${restaurantService}/api/cart/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCart(data.cart || []);
      setSubTotal(data.subtotal || 0);
      setQuantity(data.cartLength || 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingCart(false);
    }
  }

  useEffect(() => {
    //useEffect with an empty dependency array ([]) runs after the first render only.
    fetchUser();
  }, []);

  useEffect(() => {
    if (user && user.role === "customer") {
      fetchCart();
    } else if (user && user.role !== "customer") {
      setLoadingCart(false);
    }
  }, [user]);

  useEffect(() => {
    if (!navigator.geolocation)
      return alert("Please Allow Location to continue");
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();

        setLocation({
          latitude,
          longitude,
          formattedAddress: data.display_name || "current location",
        });

        const address = data?.address || {};

        setCity(
          address.city ||
            address.town ||
            address.village ||
            address.hamlet ||
            address.suburb ||
            "Your Location"
        );
        setLoadingLocation(false);
      } catch (error) {
        setLocation({
          latitude,
          longitude,
          formattedAddress: "Current Location",
        });
        setCity("Failed to load");
        setLoadingLocation(false);
      }
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        setLoading,
        fetchUser,
        location,
        loadingLocation,
        city,
        cart,
        loadingCart,
        fetchCart,
        subTotal,
        quantity,
      }}
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
