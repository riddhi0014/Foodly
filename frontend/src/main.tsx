import { StrictMode } from "react"; //it exists only during development and helps to highlight potential problems in an application. It activates additional checks and warnings for its descendants.It disappears in production builds.
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx"; //learn

export const authService = "http://localhost:5001";
export const restaurantService = "http://localhost:5002";

//Frontend does not directly communicate with the utils service.Only other backend services communicate with the utils service. The frontend communicates with the utils service through the backend services.

createRoot(document.getElementById("root")!).render(   
  <StrictMode>
    <GoogleOAuthProvider clientId="44552044223-pr5cb4u0kcg9c0vhvv014ec9gie1rfcf.apps.googleusercontent.com">
      <AppProvider>
        <App />
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);

//Role of main.tsx: Start React and provide global services like Google OAuth, App Context, React Strict Mode to the whole application i.e all components all pages of this app.
