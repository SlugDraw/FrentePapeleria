import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getTicketsByUserAndDates,
  getAllTicketsByDates,
} from "../querys/TicketsQuerys";
import Loader from "../utils/Loader";
import { useAuth } from "../context/Authcontext";
import Swal from "sweetalert2";
import TicketTabla from "../components/tables/TicketsTabla";
import { useEffect, useState } from "react";
import TicketsFilter from "../components/filters/TicketsFilter";

const Tickets = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const queryClient = useQueryClient();
  const hoy = new Date();

  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const hoy = new Date();
    const haceTresDias = new Date();
    haceTresDias.setDate(hoy.getDate() - 10);
    const formatoISO = (fecha) => fecha.toISOString().split("T")[0];

    setFechaInicio(formatoISO(haceTresDias));
    setFechaFin(formatoISO(hoy));
  }, []);

  const {
    data: tickets,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allTickets", user.id, fechaInicio, fechaFin],
    queryFn: () =>
      user.rol === "admin"
        ? getAllTicketsByDates({ fechaInicio, fechaFin })
        : getTicketsByUserAndDates({
            id: user.id,
            fechaInicio,
            fechaFin,
          }),
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
    enabled: !!user.id && !!fechaInicio && !!fechaFin,
  });

  useEffect(() => {
    if (error) {
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
    }
  }, [error]);

  const handleSearch = (inicio, fin) => {
    setFechaInicio(inicio);
    setFechaFin(fin);
    refetch();
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Historial de Tickets</h1>
      </div>
      <TicketsFilter onSearch={handleSearch} />
      {error ? (
        <p className="mt-6 text-red-500">Error: {error.message}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <TicketTabla data={tickets ?? []} />
        </div>
      )}
    </div>
  );
};

export default Tickets;
