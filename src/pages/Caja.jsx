import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Loader from "../utils/Loader";
import Swal from "sweetalert2";
import { useAuth } from "../context/Authcontext";
import { use, useEffect, useState } from "react";
import { getCajas, getCajaByUser, openSale } from "../querys/salesQuerys";
import { Form, InputNumber, Button, Card, Typography, Space, Tag } from "antd";
const { Title, Text } = Typography;

const Caja = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [form] = Form.useForm();
  const [cajaActiva, setCajaActiva] = useState(0);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
    }
  }, [isAuthenticated]);

  const {
    data: cajas,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cajas", user.rol, user.id],
    queryFn: () => (user.rol === "admin" ? getCajas() : getCajaByUser(user.id)),
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
    enabled: !!user.id,
  });

  useEffect(() => {
    if (!cajas) {
      setCajaActiva(0);
      return;
    }

    if (Array.isArray(cajas)) {
      const cajaActivaUsuario = cajas.filter(
        (e) => user.nombre === `${e.usuario.nombre} ${e.usuario.apellidos}`
      );
      setCajaActiva(cajaActivaUsuario.length);
    } else {
      setCajaActiva(1);
    }
  }, [cajas, user]);

  const { mutate: abrirCaja, isLoading: openSales } = useMutation({
    mutationKey: ["abrir-caja"],
    mutationFn: openSale,
    onSuccess: () => {
      queryClient.invalidateQueries(["cajas", user.rol]);
      Swal.fire({
        title: "Caja aperturada",
        text: "La caja se aperturó correctamente",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      form.resetFields();
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
        Swal.fire({ icon: "error", title: "Error", text: error.message });
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

  useEffect(() => {
    queryClient.invalidateQueries(["cajas", user.rol]);
  }, [user.rol, queryClient]);

  const handleOk = async (values) => {
    try {
      const values = await form.validateFields();
      await abrirCaja({
        id: user.id,
        apertura: values.monto,
      });
      form.resetFields();
      queryClient.invalidateQueries(["cajas", user.rol]);
    } catch (error) {}
    Swal.fire({
      title: "Caja aperturada",
      text: `Se aperturó la caja con $${values.monto}`,
      icon: "success",
      confirmButtonText: "Aceptar",
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const day = String(fecha.getDate()).padStart(2, "0");
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const year = fecha.getFullYear();
    return `${day}/${month}/${year}`;
  };
  // Formatear hora hh:mm
  const formatHora = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const hours = String(fecha.getHours()).padStart(2, "0");
    const minutes = String(fecha.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold">
          {user.rol === "admin" ? "Cajas (Administrador)" : "Cajas"}
        </h1>
      </div>
      {!cajas || cajas?.length === 0 ? (
        <div className="flex justify-center items-center min-h-screen bg-white">
          <Card className="w-full max-w-md rounded-2xl shadow-lg p-6">
            {/* Título */}
            <Title level={4} className="text-center mb-6">
              {user.rol === "admin"
                ? "Aperturar una Caja (Administrador)"
                : "Aperturar una Caja"}
            </Title>

            <div className="mb-4">
              <Text strong className="text-green-600 block">
                Caja para el usuario: {user.nombre}
              </Text>
            </div>

            <Form form={form} layout="vertical" onFinish={handleOk}>
              <Form.Item
                label={<Text strong>Aperturar caja con:</Text>}
                name="monto"
                rules={[
                  { required: true, message: "El monto es obligatorio" },
                  {
                    type: "number",
                    min: 0,
                    message: "El monto debe ser mayor o igual a 0",
                  },
                ]}
              >
                <InputNumber
                  placeholder="0.00"
                  min={0}
                  className="w-full rounded-lg"
                />
              </Form.Item>

              <Form.Item>
                <Space className="flex justify-end w-full">
                  <Button type="primary" htmlType="submit">
                    Aperturar
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ) : (
        <>
          {cajaActiva === 0 && (
            <div className="flex justify-center items-center min-h-screen bg-white">
              <Card className="w-full max-w-md rounded-2xl shadow-lg p-6">
                {/* Título */}
                <Title level={4} className="text-center mb-6">
                  {user.rol === "admin"
                    ? "Aperturar una Caja (Administrador)"
                    : "Aperturar una Caja"}
                </Title>

                <div className="mb-4">
                  <Text strong className="text-green-600 block">
                    Caja para el usuario: {user.nombre}
                  </Text>
                </div>

                <Form form={form} layout="vertical" onFinish={handleOk}>
                  <Form.Item
                    label={<Text strong>Aperturar caja con:</Text>}
                    name="monto"
                    rules={[
                      { required: true, message: "El monto es obligatorio" },
                      {
                        type: "number",
                        min: 0,
                        message: "El monto debe ser mayor o igual a 0",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="0.00"
                      min={0}
                      className="w-full rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space className="flex justify-end w-full">
                      <Button type="primary" htmlType="submit">
                        Aperturar
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </div>
          )}

          <div className="min-h-screen flex flex-col items-center py-10 px-6">
            <Title level={3} className="mb-8 text-center">
              {user.rol === "admin"
                ? "Cajas Abiertas (Administrador)"
                : "Cajas Abiertas"}
            </Title>

            {/* Grid de 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
              {user.rol === "admin" ? (
                cajas.map((item) => {
                  return (
                    <Card
                      key={item.id}
                      className="rounded-2xl shadow-md hover:shadow-lg transition-all"
                      title={
                        <span className="font-semibold text-lg">
                          {item.usuario.nombre} {item.usuario.apellidos}
                        </span>
                      }
                    >
                      <div className="space-y-2">
                        <Text strong>Monto Inicial: </Text>
                        <Text>${item.apertura.toFixed(2)}</Text>
                        <br />

                        <Text strong>Estado: </Text>
                        {item.status === "abierta" ? (
                          <Tag color="green">Abierta</Tag>
                        ) : (
                          <Tag color="red">Cerrada</Tag>
                        )}
                        <br />

                        <Text strong>Dia Apertura: </Text>
                        <Text>{formatFecha(item.fechaApertura)}</Text>
                        <br />

                        <Text strong>Hora Apertura: </Text>
                        <Text>{formatHora(item.fechaApertura)}</Text>
                        <br />

                        {user.nombre ===
                          `${item.usuario.nombre} ${item.usuario.apellidos}` && (
                          <div className="flex justify-end mt-4">
                            <Button
                              type="primary"
                              onClick={() => navigate(`/caja/${item.id}`)}
                            >
                              Acceder
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card
                  key={cajas.id}
                  className="rounded-2xl shadow-md hover:shadow-lg transition-all"
                  title={
                    <span className="font-semibold text-lg">{user.nombre}</span>
                  }
                >
                  <div className="space-y-2">
                    <Text strong>Monto Inicial: </Text>
                    <Text>${cajas.apertura.toFixed(2)}</Text>
                    <br />

                    <Text strong>Estado: </Text>
                    {cajas.status === "abierta" ? (
                      <Tag color="green">Abierta</Tag>
                    ) : (
                      <Tag color="red">Cerrada</Tag>
                    )}
                    <br />

                    <Text strong>Dia Apertura: </Text>
                    <Text>{formatFecha(cajas.fechaApertura)}</Text>
                    <br />

                    <Text strong>Hora Apertura: </Text>
                    <Text>{formatHora(cajas.fechaApertura)}</Text>
                    <br />

                    <div className="flex justify-end mt-4">
                      <Button
                        type="primary"
                        onClick={() => navigate(`/caja/${cajas.id}`)}
                      >
                        Acceder
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Caja;
