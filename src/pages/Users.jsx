import DataTableUsuarios from "../components/tables/UsuariosTablas";
import { useQuery } from "@tanstack/react-query";
import { listarUsuarios } from "../querys/userQuerys";
import Loader from "../utils/Loader";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../context/Authcontext";

const Users = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
    }
  }, [isAuthenticated]);

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["usuarios"],
    queryFn: listarUsuarios,
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

  useEffect(() => {
    if (error) {
      // Solo redirige si el status indica sesión expirada
      if (error.status === 401 || error.status === 403) {
        Swal.fire({
          title: "Sesión expirada",
          text: "Inicia sesión de nuevo",
          icon: "error",
          confirmButtonText: "Aceptar",
        }).then(() => {
          logout();
        });
      }
    }
  }, [error, navigate]);

  if (isLoading) return <Loader />;

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
      </div>

      {error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <DataTableUsuarios data={users ?? []} />
        </div>
      )}
    </>
  );
};

export default Users;
