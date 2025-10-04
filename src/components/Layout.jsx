import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import PrivateRoute from "../components/PrivateRoute";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Config from "../pages/Users";
import Printers from "../pages/Printers";
import Productos from "../pages/Productos";
import Caja from "../pages/Caja";
import CajaAbierta from "../pages/CajaAbierta";
import Tickets from "../pages/Tickets";

const Layout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div
      className={
        isAuthenticated ? "ml-20 md:ml-64 p-6 transition-all duration-300" : ""
      }
    >
      <Routes>
        {/* Login público (no se mueve con sidebar) */}
        <Route path="/" element={<Login />} />
        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <Config />
            </PrivateRoute>
          }
        />
        <Route
          path="/impresoras"
          element={
            <PrivateRoute>
              <Printers />
            </PrivateRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <PrivateRoute>
              <Productos />
            </PrivateRoute>
          }
        />
        <Route
          path="/caja"
          element={
            <PrivateRoute>
              <Caja />
            </PrivateRoute>
          }
        />
        <Route
          path="/caja/:idCaja"
          element={
            <PrivateRoute>
              <CajaAbierta />
            </PrivateRoute>
          }
        />
        ´
        <Route
          path="/caja/tickets"
          element={
            <PrivateRoute>
              <Tickets />
            </PrivateRoute>
          }
        />
        {/* Redirigir rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default Layout;
