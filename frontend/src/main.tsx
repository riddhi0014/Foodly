import "./utils/leaflet-setup";
import "leaflet-routing-machine";
import { StrictMode } from "react"; //it exists only during development and helps to highlight potential problems in an application. It activates additional checks and warnings for its descendants.It disappears in production builds.
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx"; //learn
import { SocketProvider } from "./context/SocketContext.tsx";
export const authService = import.meta.env.VITE_AUTH_SERVICE || "https://foodly-auth.onrender.com";
export const restaurantService = import.meta.env.VITE_RESTAURANT_SERVICE || "https://foodly-restaurant.onrender.com";
export const utilsService = import.meta.env.VITE_UTILS_SERVICE || "https://foodly-utils.onrender.com";
export const realtimeService = import.meta.env.VITE_REALTIME_SERVICE || "https://foodly-realtime.onrender.com";
export const riderService = import.meta.env.VITE_RIDER_SERVICE || "https://foodly-rider.onrender.com";
export const adminService = import.meta.env.VITE_ADMIN_SERVICE || "https://foodly-admin-xam9.onrender.com";

//Frontend does not directly communicate with the utils service.Only other backend services communicate with the utils service. The frontend communicates with the utils service through the backend services.

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="44552044223-pr5cb4u0kcg9c0vhvv014ec9gie1rfcf.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);

//Role of main.tsx: Start React and provide global services like Google OAuth, App Context, React Strict Mode to the whole application i.e all components all pages of this app.
