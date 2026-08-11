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

const FORMAS_DE_PAGO = ["Efectivo", "Tarjeta", "Vales", "Transferencia"];

const Modaltickets = ({ visible, onCancel, idCaja, empleado }) => {
  const [form] = Form.useForm();
  const [productos, setProductos] = useState([]);
  const [descuentoTotal, setDescuentoTotal] = useState(0);
  const [pagosMixtos, setPagosMixtos] = useState([]);
  const { logout } = useAuth();
  const formaDePagoSeleccionada = Form.useWatch("formaDePago", form);

  const queryClient = useQueryClient();

  const { Title, Text } = Typography;

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setProductos([]);
      setDescuentoTotal(0);
      setPagosMixtos([]);
    }
  }, [visible, form]);

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

  const calcularSubtotal = (precio, cantidad, descuento) =>
    precio * cantidad * (1 - descuento / 100);

  const agregarProducto = (producto) => {
    setProductos((detalleActual) => {
      const indice = detalleActual.findIndex((item) => item.id === producto.id);

      if (indice === -1) {
        return [
          ...detalleActual,
          {
            id: producto.id,
            codigo: producto.code,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            cantidad: 1,
            descuento: 0,
            precio: producto.precio,
            subtotal: calcularSubtotal(producto.precio, 1, 0),
          },
        ];
      }

      return detalleActual.map((item, index) => {
        if (index !== indice) return item;
        const cantidad = item.cantidad + 1;
        return {
          ...item,
          cantidad,
          subtotal: calcularSubtotal(item.precio, cantidad, item.descuento),
        };
      });
    });
  };

  const registrarProducto = (codigo) => {
    const producto = products?.find(
      (item) =>
        item.code.toString().toLowerCase() ===
        codigo?.toString().trim().toLowerCase(),
    );

    if (!producto) return false;

    agregarProducto(producto);
    form.resetFields(["producto"]);
    return true;
  };

  const actualizarDetalle = (indice, campo, valor) => {
    setProductos((detalleActual) =>
      detalleActual.map((item, index) => {
        if (index !== indice) return item;
        const actualizado = { ...item, [campo]: valor };
        return {
          ...actualizado,
          subtotal: calcularSubtotal(
            actualizado.precio,
            actualizado.cantidad,
            actualizado.descuento,
          ),
        };
      }),
    );
  };

  const actualizarPagoMixto = (indice, campo, valor) => {
    setPagosMixtos((pagos) =>
      pagos.map((pago, index) =>
        index === indice ? { ...pago, [campo]: valor } : pago,
      ),
    );
  };

  const agregarPagoMixto = () => {
    setPagosMixtos((pagos) => [
      ...pagos,
      { formaDePago: undefined, monto: 0 },
    ]);
  };

  const eliminarPagoMixto = (indice) => {
    setPagosMixtos((pagos) => pagos.filter((_, index) => index !== indice));
  };

  const cambiarFormaDePago = (formaDePago) => {
    if (formaDePago === "Mixto") {
      setPagosMixtos([
        { formaDePago: undefined, monto: 0 },
        { formaDePago: undefined, monto: 0 },
      ]);
      return;
    }
    setPagosMixtos([]);
  };

  const subtotalProductos = productos.reduce(
    (acumulado, producto) => acumulado + producto.subtotal,
    0,
  );
  const importeDescuentoTotal = subtotalProductos * (descuentoTotal / 100);
  const total = subtotalProductos - importeDescuentoTotal;

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

    if (formaDePago === "Mixto") {
      const pagosIncompletos = pagosMixtos.some(
        (pago) => !pago.formaDePago || !pago.monto || pago.monto <= 0,
      );
      const formasRepetidas = new Set(
        pagosMixtos.map((pago) => pago.formaDePago),
      ).size !== pagosMixtos.length;
      const totalAsignado = pagosMixtos.reduce(
        (acumulado, pago) => acumulado + Number(pago.monto || 0),
        0,
      );

      if (pagosMixtos.length < 2 || pagosIncompletos || formasRepetidas) {
        Swal.fire({
          icon: "warning",
          title: "Pagos mixtos incompletos",
          text: "Agrega al menos dos formas de pago distintas e indica un importe válido para cada una.",
        });
        return;
      }

      if (Math.abs(totalAsignado - total) > 0.01) {
        Swal.fire({
          icon: "warning",
          title: "Total pendiente de asignar",
          text: `Los pagos mixtos suman $${totalAsignado.toFixed(2)} y la venta es de $${total.toFixed(2)}.`,
        });
        return;
      }
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
        empleado: empleado.code,
        descuentoTotal,
        pagosMixtos: formaDePago === "Mixto" ? pagosMixtos : [],
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["tickets", idCaja]);
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
          TicketVenta(
            `${empleado.nombre} ${empleado.apellidos}`,
            {
              ...data,
              formaDePago: variables.formaDePago,
              descuentoTotal: variables.descuentoTotal,
              pagosMixtos: variables.pagosMixtos,
            },
            productos,
          );
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
        <Text strong>Subtotal:</Text>
        <Text className="text-lg font-semibold text-green-600">
          ${subtotalProductos.toFixed(2)}
        </Text>
      </div>
      {descuentoTotal > 0 && (
        <div className="mt-1 flex justify-between items-center text-red-600">
          <Text>Descuento general ({descuentoTotal}%):</Text>
          <Text>-${importeDescuentoTotal.toFixed(2)}</Text>
        </div>
      )}
      <div className="mt-1 flex justify-between items-center">
        <Text strong>Total:</Text>
        <Text className="text-lg font-semibold text-green-600">
          ${total.toFixed(2)}
        </Text>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Venta realizada por: {empleado?.nombre} {empleado?.apellidos}
      </div>
      <Form form={form} layout="vertical" requiredMark>
        {/* Un código válido se agrega de inmediato al detalle. */}
        <Form.Item name="producto" label="Producto">
          <Select
            showSearch
            placeholder="Busca o escanea un producto"
            optionFilterProp="children"
            onSearch={registrarProducto}
            onChange={registrarProducto}
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

        {/* Lista de productos agregados */}
        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
          {productos.map((p, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-100 p-2 rounded-lg"
            >
              <div className="flex-1">
                <span>
                  {p.codigo} - {p.nombre} : {p.cantidad} X {p.precio.toFixed(2)}{" "}
                  = ${p.subtotal.toFixed(2)}
                  {p.descuento > 0 && (
                    <strong style={{ color: "red", marginLeft: 8 }}>
                      ( {p.descuento}% Descuento )
                    </strong>
                  )}
                </span>
                <div className="mt-2 flex flex-wrap gap-3">
                  <label>
                    Cantidad
                    <InputNumber
                      min={1}
                      precision={0}
                      value={p.cantidad}
                      onChange={(valor) =>
                        actualizarDetalle(i, "cantidad", valor || 1)
                      }
                      className="ml-2"
                    />
                  </label>
                  <label>
                    Descuento (%)
                    <InputNumber
                      min={0}
                      max={100}
                      precision={0}
                      value={p.descuento}
                      onChange={(valor) =>
                        actualizarDetalle(i, "descuento", valor || 0)
                      }
                      className="ml-2"
                    />
                  </label>
                </div>
              </div>
              <Button
                type="link"
                danger
                onClick={() => {
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
          <Form.Item name="descuentoTotal" label="Descuento general (%)">
            <InputNumber
              min={0}
              max={100}
              precision={0}
              placeholder="0"
              style={{ width: "100%" }}
              onChange={(valor) => setDescuentoTotal(valor || 0)}
            />
          </Form.Item>

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
            <Select
              placeholder="Selecciona una forma de pago"
              onChange={cambiarFormaDePago}
            >
              <Select.Option value="Efectivo">Efectivo</Select.Option>
              <Select.Option value="Tarjeta">
                Tarjeta de Débito/Crédito
              </Select.Option>
              <Select.Option value="Vales">Vales electrónicos</Select.Option>
              <Select.Option value="Transferencia">Transferencia</Select.Option>
              <Select.Option value="Mixto">Mixto</Select.Option>
            </Select>
          </Form.Item>

          {formaDePagoSeleccionada === "Mixto" && (
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <Text strong>Distribución de pagos</Text>
                <Text type="secondary">
                  Asignado: $
                  {pagosMixtos
                    .reduce(
                      (acumulado, pago) =>
                        acumulado + Number(pago.monto || 0),
                      0,
                    )
                    .toFixed(2)}
                  / ${total.toFixed(2)}
                </Text>
              </div>

              {pagosMixtos.map((pago, indice) => (
                <div key={indice} className="mb-2 flex gap-2">
                  <Select
                    value={pago.formaDePago}
                    placeholder="Forma de pago"
                    className="flex-1"
                    onChange={(valor) =>
                      actualizarPagoMixto(indice, "formaDePago", valor)
                    }
                  >
                    {FORMAS_DE_PAGO.filter(
                      (forma) =>
                        forma === pago.formaDePago ||
                        !pagosMixtos.some(
                          (otroPago, otroIndice) =>
                            otroIndice !== indice &&
                            otroPago.formaDePago === forma,
                        ),
                    ).map((forma) => (
                      <Select.Option key={forma} value={forma}>
                        {forma}
                      </Select.Option>
                    ))}
                  </Select>
                  <InputNumber
                    min={0.01}
                    precision={2}
                    value={pago.monto}
                    placeholder="Importe"
                    className="w-32"
                    onChange={(valor) =>
                      actualizarPagoMixto(indice, "monto", valor || 0)
                    }
                  />
                  <Button
                    danger
                    type="text"
                    disabled={pagosMixtos.length <= 2}
                    onClick={() => eliminarPagoMixto(indice)}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}

              <Button
                type="dashed"
                block
                disabled={pagosMixtos.length >= FORMAS_DE_PAGO.length}
                onClick={agregarPagoMixto}
              >
                Agregar forma de pago
              </Button>
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default Modaltickets;
