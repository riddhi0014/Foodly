import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import PublicRoute from "./components/publicRoute";
import ProtectedRoute from "./components/protectedRoute";
import SelectRole from "./pages/SelectRole";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            {/* PublicRoute component will handle the logic for public routes.This is  a  wrapper route. */}
            <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/select-role" element={<SelectRole />} />
          </Route>
        </Routes>
        <Toaster />
        {/*Exists outside Routes so that it can be used in any page.Every page can display notifications using this toaster.
         */}
      </BrowserRouter>
    </>
  );
};

export default App;
