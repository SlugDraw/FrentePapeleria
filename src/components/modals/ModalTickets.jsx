import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  InputNumber,
} from "antd";
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
        (p) => p.code.toString() === values.producto.toString(),
      );
      let subtotal = item[0].precio * values.cantidad;

      if (values.descuento > 0) {
        subtotal = subtotal - (subtotal * values.descuento) / 100;
      }

      setTotal(parseFloat(total) + subtotal);
      setProductos([
        ...productos,
        {
          id: item[0].id,
          codigo: values.producto,
          nombre: item[0].nombre,
          cantidad: values.cantidad,
          descuento: values.descuento || 0,
          precio: item[0].precio,
          subtotal,
        },
      ]);

      form.resetFields(["producto", "cantidad", "descuento"]);
    }
  };

  const handleSave = async () => {
    const formaDePago = form.getFieldValue("formaDePago");

    if (!formaDePago) {
      Swal.fire({
        icon: "warning",
        title: "Forma de pago requerida",
        text: "Por favor selecciona una forma de pago antes de continuar.",
      });
      return;
    }
    const prods = productos.map((p) => {
      return { producto: p.id, cantidad: p.cantidad, descuento: p.descuento };
    });
    if (prods.length !== 0) {
      const data = {
        serial: "",
        productos: prods,
        caja: idCaja,
        total: total,
        formaDePago: formaDePago,
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
      setTotal(0);
      form.resetFields();
      Swal.fire({
        title: "Venta registrada",
        text: "¿Desea imprimir su ticket?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Imprimir",
        cancelButtonText: "No imprimir",
      }).then((result) => {
        if (result.isConfirmed) {
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
      maskClosable={false}
      keyboard={false}
      width="60%"
    >
      <div className="mt-4 flex justify-between items-center border-t pt-3">
        <Text strong>Total:</Text>
        <Text className="text-lg font-semibold text-green-600">
          ${total.toFixed(2)}
        </Text>
      </div>
      <Form form={form} layout="vertical" requiredMark>
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
            onChange={() => {
              form.setFieldsValue({ cantidad: 1 });
              form.setFieldsValue({ descuento: 0 });
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
        <Form.Item
          name="cantidad"
          label="Cantidad"
          rules={[{ required: true, message: "La cantidad es obligatoria" }]}
        >
          <InputNumber min={1} precision={0} style={{ width: "100%" }} />
        </Form.Item>

        {/* Descuentos */}
        <Form.Item name="descuento" label="Descuento (%)">
          <InputNumber
            min={0}
            max={100}
            precision={0}
            style={{ width: "100%" }}
          />
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

        {/* Lista de productos agregados */}
        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
          {productos.map((p, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-100 p-2 rounded-lg"
            >
              <span>
                {p.codigo} - {p.nombre} : {p.cantidad} X {p.precio.toFixed(2)} =
                ${p.subtotal.toFixed(2)}
                {p.descuento > 0 && (
                  <strong style={{ color: "red", marginLeft: 8 }}>
                    ( {p.descuento}% Descuento )
                  </strong>
                )}
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

        {/* Se agrega  select de forma de pago*/}
        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
          <Form.Item
            name="formaDePago"
            label="Forma de Pago"
            rules={[
              {
                required: true,
                message: "Selecciona una forma de pago",
              },
            ]}
          >
            <Select placeholder="Selecciona una forma de pago">
              <Select.Option value="Efectivo">Efectivo</Select.Option>
              <Select.Option value="TDC">Tarjeta de Crédito</Select.Option>
              <Select.Option value="TDD">Tarjeta de Débito</Select.Option>
              <Select.Option value="Transferencia">Transferencia</Select.Option>
            </Select>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default Modaltickets;
