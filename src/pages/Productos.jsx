import DataTableProductos from "../components/tables/ProductosTabla";
import { useQuery } from "@tanstack/react-query";
import { listarProductos } from "../querys/productQuerys";
import Loader from "../utils/Loader";
import { useAuth } from "../context/Authcontext";

const Productos = () => {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
    }
  }, [isAuthenticated]);

  const {
    data: productos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["productos"],
    queryFn: listarProductos,
    onError: (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        Swal.fire({
          title: "Sesión expirada",
          text: "Inicia sesión de nuevo",
          icon: "error",
          confirmButtonText: "Aceptar",
        }).then(() => {
          logout();
        });
      }
    },
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Productos</h1>
      </div>

      {error ? (
        <p className="mt-6 text-red-500">Error: {error.message}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <DataTableProductos data={productos || []} />
        </div>
      )}
    </div>
  );
};

export default Productos;
