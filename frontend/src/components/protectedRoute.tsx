import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppData } from "../context/AppContext";

const ProtectedRoute = () => {
  const { isAuth, user, loading } = useAppData();
  const location = useLocation();

  console.log("========== PROTECTED ROUTE =========="); //temp
  console.log("loading:", loading);
  console.log("isAuth:", isAuth);
  console.log("user:", user);
  console.log("user.role:", user?.role);
  console.log("pathname:", location.pathname);
  console.log("====================================");

  if (loading) return null;

  if (!isAuth) {
    return <Navigate to={"/login"} replace />;
  }

  if (user?.role === null && location.pathname !== "/select-role") {
    return <Navigate to={"/select-role"} replace />;
  }

  if (user?.role !== null && location.pathname === "/select-role") {
    return <Navigate to={"/"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

//outlet is simply a placeholder for the child routes that will be rendered inside the protected route. It allows you to nest routes and render the appropriate component based on the current route.
