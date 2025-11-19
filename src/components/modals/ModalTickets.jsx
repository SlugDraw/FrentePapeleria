import { Modal, Form, Input, Button, Select, Space, Typography } from "antd";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { listarProductos } from "../../querys/productQuerys";
import { createTicket } from "../../querys/TicketsQuerys";
import Swal from "sweetalert2";
import { useAuth } from "../../context/Authcontext";
import TicketVenta from "../../tickets/TicketVenta";

const Modaltickets = ({ visible, onCancel, idCaja }) => {
  const [form] = Form.useForm();
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const { logout, user } = useAuth();

  const queryClient = useQueryClient();

  const { Title, Text } = Typography;

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setProductos([]);
      setTotal(0);
    }
  }, [visible, form, setProductos, setTotal]);

  const {
    data: products,
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

  const handleAddProducto = () => {
    const values = form.getFieldsValue();
    if (values.producto && values.cantidad) {
      const item = products.filter(
        (p) => p.code.toString() === values.producto.toString()
      );

      const subtotal = item[0].precio * values.cantidad;

      setTotal(parseFloat(total) + subtotal);

      setProductos([
        ...productos,
        {
          id: item[0].id,
          codigo: values.producto,
          nombre: item[0].nombre,
          cantidad: values.cantidad,
          precio: item[0].precio,
          subtotal,
        },
      ]);

      form.resetFields(["producto", "cantidad"]);
    }
  };

  const handleSave = async () => {
    const prods = productos.map((p) => {
      return { producto: p.id, cantidad: p.cantidad };
    });
    if (prods.length !== 0) {
      const data = {
        serial: "",
        productos: prods,
        caja: idCaja,
        total: total,
      };
      Swal.fire({
        title: "¿Desea continuar con la compra?",
        text: "Confirme si desea registrar la venta.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, continuar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await crearTicketMutate(data);
          setTotal(0);
          form.resetFields();
        }
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "Sin productos",
        text: "No puedes guardar una venta sin productos registrados.",
      });
    }
  };

  const { mutate: crearTicketMutate, isLoading: creatingticket } = useMutation({
    mutationKey: ["crearTicket"],
    mutationFn: createTicket,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(["tickets", idCaja]);
      Swal.fire({
        title: "Venta registrada",
        text: "¿Desea imprimir su ticket?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Imprimir",
        cancelButtonText: "No imprimir",
      }).then((result) => {
        if (result.isConfirmed) {
          console.log("se imprime el ticket");
          TicketVenta(user.nombre, data, productos);
        }
        onCancel(); // Cierra el modal después de la acción
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
      } else {
        Swal.fire({
          title: "Error en la venta",
          text: error.message,
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    },
  });

  if (isLoading)
    return (
      <>
        <h1>Cargando</h1>
      </>
    );
  return (
    <Modal
      title={<Title level={4}>Nueva Venta</Title>}
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      okText="Guardar Venta"
      cancelText="Cancelar"
    >
      <div className="mt-4 flex justify-between items-center border-t pt-3">
        <Text strong>Total:</Text>
        <Text className="text-lg font-semibold text-green-600">
          ${total.toFixed(2)}
        </Text>
      </div>
      <Form form={form} layout="vertical">
        {/* Selector de producto con búsqueda */}
        <Form.Item name="producto" label="Producto">
          <Select
            showSearch
            placeholder="Buscar producto"
            optionFilterProp="children"
            filterOption={(input, option) => {
              const nombre = option?.children?.toLowerCase() || "";
              const code = option?.value?.toLowerCase() || "";
              return (
                nombre.includes(input.toLowerCase()) ||
                code.includes(input.toLowerCase())
              );
            }}
          >
            {products.map((p) => (
              <Select.Option key={p.code} value={p.code}>
                {p.nombre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Cantidad */}
        <Form.Item name="cantidad" label="Cantidad">
          <Input type="number" min={1} placeholder="1" />
        </Form.Item>

        <Form.Item>
          <Button
            type="dashed"
            block
            onClick={handleAddProducto}
            className="mt-2"
          >
            Agregar Producto
          </Button>
        </Form.Item>
      </Form>

      {/* Lista de productos agregados */}
      <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
        {productos.map((p, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-gray-100 p-2 rounded-lg"
          >
            <span>
              {p.codigo} - {p.nombre}: {p.cantidad} X {p.precio} = {p.subtotal}
            </span>
            <Button
              type="link"
              danger
              onClick={() => {
                setTotal(total - p.subtotal);
                setProductos(productos.filter((_, index) => index !== i));
              }}
            >
              Eliminar
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default Modaltickets;
