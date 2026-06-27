import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const authService = "http://localhost:5001";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="44552044223-pr5cb4u0kcg9c0vhvv014ec9gie1rfcf.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
    ;
  </StrictMode>
);
