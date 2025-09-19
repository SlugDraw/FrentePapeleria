import { Link } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      {/* Usuario logeado (lado izquierdo) */}
      <div className="font-semibold">👋 Hola, {user}</div>

      {/* Enlaces y logout (lado derecho) */}
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="hover:text-blue-400">
          Dashboard
        </Link>
        <Link to="/config" className="hover:text-blue-400">
          Configuraciones
        </Link>
        <button
          onClick={logout}
          className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
