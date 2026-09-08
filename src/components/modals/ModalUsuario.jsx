import { useEffect, useRef } from "react";
import { Modal, Form, Input, Select } from "antd";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../../utils/Loader";
import { crearUsuario, actualizarUsuario } from "../../querys/userQuerys";
import { useAuth } from "../../context/Authcontext";
import JsBarcode from "jsbarcode";
import { BarcodeOutlined } from "@ant-design/icons";

const ModalUsuario = ({ visible, onCancel, initialValues }) => {
  const [form] = Form.useForm();
  const inputRef = useRef(null);
  const barcodeRef = useRef(null);
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const listadoUsuarios = queryClient.getQueryData(["usuarios"]);

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
          codigo: "",
        },
      );
      if (initialValues && initialValues.codigo) {
        renderBarcode(initialValues.codigo);
      } else {
        if (barcodeRef.current) barcodeRef.current.innerHTML = "";
        if (inputRef.current) inputRef.current.input.value = "";
      }
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
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "Por favor, revisa los campos del formulario.",
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (barcodeRef.current) barcodeRef.current.innerHTML = "";
    if (inputRef.current) inputRef.current.input.value = "";
    onCancel();
  };

  const renderBarcode = (codigo) => {
    if (barcodeRef.current && codigo) {
      const limpio = codigo.trim();

      JsBarcode(barcodeRef.current, limpio, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 40,
        displayValue: true,
      });
    } else if (barcodeRef.current) {
      barcodeRef.current.innerHTML = "";
    }
  };

  const generateCodigo = (rol) => {
    form.setFieldsValue({ codigo: "" });
    barcodeRef.current.innerHTML = "";
    if (typeof rol === "string") {
      const prefix = rol.charAt(0).toUpperCase();
      const count = listadoUsuarios
        ? listadoUsuarios.filter((u) => u.rol === rol).length + 1
        : 1;
      const codigo = `${prefix}${String(count).padStart(4, "0")}`;
      form.setFieldsValue({ codigo: codigo });
      renderBarcode(codigo);
    } else {
      const usuario = form.getFieldValue("username");
      const user = listadoUsuarios?.find((u) => u.username === usuario);
      const prefix = user.rol.charAt(0).toUpperCase();
      const usuariosMismoRol = listadoUsuarios.filter(
        (u) => u.rol === user.rol,
      );

      const numeros = usuariosMismoRol.map((u) => {
        const numero = parseInt(u.codigo.replace(prefix, ""));
        return isNaN(numero) ? 0 : numero;
      });
      const maxNumero = Math.max(...numeros, 0);
      const nuevoNumero = maxNumero + 1;
      const codigo = `${prefix}${String(nuevoNumero).padStart(4, "0")}`;
      form.setFieldsValue({ codigo: codigo });
      renderBarcode(codigo);
    }
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
        maskClosable={false}
        keyboard={false}
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
            <Select
              placeholder="Seleccione un rol"
              onChange={(value) => generateCodigo(value)}
            >
              <Select.Option value="admin">Administrador</Select.Option>
              <Select.Option value="gerente">Gerente</Select.Option>
              <Select.Option value="empleado">Empleado</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="codigo"
            label="Código de Barras"
            rules={[{ required: true }]}
          >
            <Input
              ref={inputRef}
              autoComplete="off"
              readOnly
              suffix={
                <BarcodeOutlined
                  onClick={initialValues ? generateCodigo : undefined}
                  style={{
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#1890ff",
                  }}
                />
              }
            />
          </Form.Item>
          <svg ref={barcodeRef}></svg>
        </Form>
      </Modal>
    </>
  );
};

export default ModalUsuario;
