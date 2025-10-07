import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/Authcontext";
import { Button } from "antd";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getCajaById, closeSales } from "../querys/salesQuerys";
import { getTicketsByIdCaja } from "../querys/TicketsQuerys";
import Loader from "../utils/Loader";
import TicketTabla from "../components/tables/TicketsTabla";
import ModalTicket from "../components/modals/ModalTickets";
import Swal from "sweetalert2";

const CajaAbierta = () => {
  const { idCaja } = useParams();
  const { isAuthenticated, logout, user } = useAuth();
  const [visible, setVisible] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
    }
  }, [isAuthenticated]);

  const {
    data: caja,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["caja", idCaja],
    queryFn: () => getCajaById(idCaja),
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
    enabled: !!idCaja,
  });

  const {
    data: tickets,
    ticketLoader,
    ticketError,
  } = useQuery({
    queryKey: ["tickets", idCaja],
    queryFn: () => getTicketsByIdCaja(idCaja),
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
    enabled: !!idCaja,
  });

  const totalVenta = tickets?.reduce(
    (acc, ticket) => acc + (ticket.total || 0),
    0
  );

  const { mutate: closeSale, isLoading: close } = useMutation({
    mutationKey: ["closeSale"],
    mutationFn: closeSales,
    onSuccess: () => {
      queryClient.invalidateQueries(["cajas", user.rol, user.id]);
      Swal.fire({
        title: "Caja cerrada",
        text: "La caja ha sido cerrada exitosamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/caja");
        }
      });
    },
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

  const cerrarCaja = async (idCaja) => {
    const result = await Swal.fire({
      title: "¿Cerrar caja?",
      text: "¿Estás seguro de que deseas cerrar la caja? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      closeSale({ idCaja, totalVenta });
    }
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold">
          {user.rol === "admin"
            ? `Caja de ${user.nombre} (Administrador)`
            : `Caja de ${user.nombre}`}
        </h1>
      </div>

      <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4 shadow">
        {/* Izquierda: textos */}
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="block text-sm text-gray-600">Venta total</span>
            <span className="text-lg font-semibold text-green-600">
              {totalVenta?.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="block text-sm text-gray-600">Aperturada con</span>
            <span className="text-lg font-semibold text-blue-600">
              {caja.apertura.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Derecha: botones */}
        <div className="flex gap-2">
          <Button type="primary" onClick={() => setVisible(true)}>
            Nueva Venta
          </Button>
          <Button danger onClick={() => cerrarCaja(idCaja)}>
            Cerrar Caja
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <TicketTabla data={tickets ?? []} />
      </div>

      <ModalTicket
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={() => setVisible(false)}
        idCaja={idCaja}
      />
    </>
  );
};

export default CajaAbierta;
