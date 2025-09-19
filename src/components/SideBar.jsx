import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  NotebookText,
} from "lucide-react";

export default function Sidebar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    logout();
    navigate("/");
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen ${
        isCollapsed ? "w-20" : "w-64"
      } bg-gray-900 text-white flex flex-col transition-all duration-300`}
    >
      {/* Botón de colapsar */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <h2 className="text-lg font-bold">👋 Hola, {user}</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded hover:bg-gray-700"
        >
          <Menu />
        </button>
      </div>

      {/* Enlaces */}
      <nav className="flex flex-col space-y-2 mt-6 flex-grow">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-md"
        >
          <LayoutDashboard size={20} />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        <Link
          to="/usuarios"
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-md"
        >
          <User size={20} />
          {!isCollapsed && <span>Usuarios</span>}
        </Link>

        <Link
          to="/productos"
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-md"
        >
          <NotebookText size={20} />
          {!isCollapsed && <span>Productos</span>}
        </Link>
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full bg-red-600 rounded-md hover:bg-red-700"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
