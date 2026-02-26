import { Modal, Typography, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getTicketById } from "../../querys/TicketsQuerys";
import { useAuth } from "../../context/Authcontext";
import Swal from "sweetalert2";
import { useEffect } from "react";
import TicketVenta from "../../tickets/TicketVenta";

const { Title, Text } = Typography;

const ModalTicketsDetail = ({ visible, onCancel, venta }) => {
  const { isAuthenticated, logout, user } = useAuth();

  const {
    data: detalleVenta,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["detalleVenta", venta?.id],
    queryFn: () => getTicketById(venta?.id),
    enabled: !!venta?.id && !!visible,
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
    if (!isAuthenticated) {
      logout();
    }
  }, [isAuthenticated]);

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

  console.log("Detalle de Venta:", detalleVenta);

  return (
    <Modal
      title={<Title level={4}>Detalle de Venta</Title>}
      open={visible}
      onCancel={onCancel}
      footer={[
        <div className="justify-end">
          <Button
            className="m-2"
            type="primary"
            onClick={() => {
              console.log(venta);
              TicketVenta(user.nombre, venta, detalleVenta?.productos);
            }}
          >
            Reimprimir Ticket
          </Button>
          <Button className="m-2" key="close" danger onClick={onCancel}>
            Cerrar
          </Button>
        </div>,
      ]}
    >
      <div className="mb-4">
        <Text strong>Folio de Venta:</Text> <Text>{venta?.serial}</Text>
        <br />
        <Text strong>Fecha:</Text>{" "}
        <Text>
          {venta?.fecha
            ? new Date(venta.fecha).toLocaleString("es-MX", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : ""}
        </Text>
        <br />
        <Text strong>Forma de Pago:</Text> <Text>{venta?.formaDePago}</Text>
        <br />
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto border-t pt-3">
        {detalleVenta?.productos.map((p, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-gray-100 p-2 rounded-lg"
          >
            <span>
              {p.producto.code} - {p.producto.nombre} : {p.cantidad} X{" "}
              {p.producto.precio.toFixed(2)} ={" "}
              {(p?.producto?.precio
                ? Number(p.producto.precio) * Number(p.cantidad) -
                  (Number(p?.descuento) > 0
                    ? (Number(p.producto.precio) *
                        Number(p.cantidad) *
                        Number(p.descuento)) /
                      100
                    : 0)
                : 0
              ).toFixed(2)}
              {p?.descuento > 0 ? (
                <strong style={{ color: "red", marginLeft: 8 }}>
                  (Descuento: {p.descuento}%){" "}
                </strong>
              ) : (
                ""
              )}
            </span>
          </div>
        ))}
      </div>
      {/* Total */}
      <div className="mt-4 flex justify-between items-center border-t pt-3">
        <Text strong>Total:</Text>
        <Text className="text-lg font-semibold text-green-600">
          ${venta?.total.toFixed(2)}
        </Text>
      </div>
    </Modal>
  );
};

export default ModalTicketsDetail;
