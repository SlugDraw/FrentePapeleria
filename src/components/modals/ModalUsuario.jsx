import { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../../utils/Loader"; // loader pantalla completa
import { crearUsuario, actualizarUsuario } from "../../querys/userQuerys"; // 👈 import actualizado

const ModalUsuario = ({ visible, onCancel, initialValues }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // --- Mutations ---
  const { mutate: crearUsuarioMutate, isLoading: creating } = useMutation({
    mutationKey: ["crear-usuario"],
    mutationFn: crearUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries(["usuarios"]);
      Swal.fire({
        icon: "success",
        title: "Usuario creado correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
      form.resetFields();
    },
    onError: (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        Swal.fire("Sesión expirada", "Inicia sesión de nuevo", "error");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        Swal.fire({ icon: "error", title: "Error", text: error.message });
      }
    },
  });

  const { mutate: actualizarUsuarioMutate, isLoading: updating } = useMutation({
    mutationKey: ["actualizar-usuario"],
    mutationFn: actualizarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries(["usuarios"]);
      Swal.fire({
        icon: "success",
        title: "Usuario actualizado correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
      form.resetFields();
    },
    onError: (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        Swal.fire("Sesión expirada", "Inicia sesión de nuevo", "error");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        Swal.fire({ icon: "error", title: "Error", text: error.message });
      }
    },
  });

  // --- Cargar valores iniciales ---
  useEffect(() => {
    if (visible) {
      form.setFieldsValue(
        initialValues || {
          nombre: "",
          apellidos: "",
          username: "",
          password: "",
          rol: "",
        }
      );
    }
  }, [visible, initialValues, form]);

  // --- Botón OK ---
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (initialValues) {
        actualizarUsuarioMutate({ id: initialValues.id, ...values });
      } else {
        crearUsuarioMutate(values);
      }
      form.resetFields();
      onCancel();
    } catch (errorInfo) {
      console.log("Validación fallida:", errorInfo);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const isLoading = creating || updating;

  return (
    <>
      {isLoading && <Loader />} {/* Loader pantalla completa */}
      <Modal
        open={visible}
        title={initialValues ? "Editar Usuario" : "Crear Usuario"}
        onCancel={handleCancel}
        onOk={handleOk}
        okText={initialValues ? "Actualizar" : "Crear"}
        cancelText="Cancelar"
        confirmLoading={isLoading} // loader en el botón
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: "Ingrese el nombre" }]}
          >
            <Input autoComplete="off" />
          </Form.Item>

          <Form.Item
            name="apellidos"
            label="Apellidos"
            rules={[{ required: true, message: "Ingrese los apellidos" }]}
          >
            <Input autoComplete="off" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Ingrese el username" }]}
          >
            <Input autoComplete="off" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={
              initialValues
                ? []
                : [{ required: true, message: "Ingrese la contraseña" }]
            }
          >
            <Input.Password
              placeholder={
                initialValues ? "Dejar vacío para mantener actual" : ""
              }
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            name="rol"
            label="Rol"
            rules={[{ required: true, message: "Seleccione un rol" }]}
          >
            <Select placeholder="Seleccione un rol">
              <Select.Option value="admin">Administrador</Select.Option>
              <Select.Option value="empleado">Empleado</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModalUsuario;
