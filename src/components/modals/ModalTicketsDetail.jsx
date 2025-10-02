import { Modal, Typography, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getTicketById } from "../../querys/TicketsQuerys";

const { Title, Text } = Typography;

const ModalTicketsDetail = ({ visible, onCancel, venta }) => {
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
        Swal.fire("Sesión expirada", "Inicia sesión de nuevo", "error");
        localStorage.removeItem("token");
        navigate("/");
      }
    },
  });

  return (
    <Modal
      title={<Title level={4}>Detalle de Venta</Title>}
      open={visible}
      onCancel={onCancel}
      footer={[
        <div className="justify-end">
          <Button className="m-2" type="primary">
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
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : ""}
        </Text>
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
              {p.producto.precio} ={" "}
              {p?.producto?.precio
                ? (
                    parseFloat(p.producto.precio) * parseFloat(p.cantidad)
                  ).toFixed(2)
                : 0}
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
