import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { useEffect, useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { configMenu } from "../pages/ConfigMenu";

export default function Sidebar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [rol, setRol] = useState("");

  useEffect(() => {
    const storedRol = user?.rol || "";
    if (storedRol) {
      setRol(storedRol);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
      navigate("/");
    }
  }, [isAuthenticated]);

  const toggleOpen = (e) => {
    e.preventDefault(); // evitar navegación inmediata
    setOpen((prev) => !prev);
  };

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const allowedMenus = configMenu.filter((item) =>
    item.roles.includes(user?.rol),
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-screen ${
        isCollapsed ? "w-20" : "w-64"
      } bg-gray-900 text-white flex flex-col transition-all duration-300`}
    >
      {/* Botón de colapsar */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <h2 className="text-lg font-bold">
            👋 Hola, {user.nombre} ({user.rol})
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded hover:bg-gray-700"
        >
          <Menu />
        </button>
      </div>

      {/* Enlaces */}
      <nav className="flex flex-col space-y-2 mt-6 flex-grow">
        {allowedMenus.map((item) => {
          const Icon = item.icon;

          // MENU CON SUBMENU
          if (item.children) {
            return (
              <div key={item.label} className="relative flex flex-col">
                <button
                  onClick={toggleOpen}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-md text-left"
                >
                  <Icon size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>

                {open && !isCollapsed && (
                  <div className="ml-6 mt-1 flex flex-col bg-gray-800 rounded-md shadow-lg z-10">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className="px-4 py-2 hover:bg-gray-700 rounded-md whitespace-nowrap"
                        onClick={() => setOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // MENU NORMAL
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-md"
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
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
