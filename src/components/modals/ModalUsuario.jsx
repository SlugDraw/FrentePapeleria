import { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import Swal from "sweetalert2";

const ModalUsuario = ({ visible, onCancel, onOk, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      console.log(initialValues);

      form.setFieldsValue(
        initialValues || {
          nombre: "",
          apellids: "",
          username: "",
          password: "",
          rol: "",
        }
      );
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields(); // valida todos los campos

      // Enviar los datos al backend
      const token = localStorage.getItem("token"); // o donde tengas el token
      if (initialValues) {
        values.id = initialValues.id;
      } // Asegúrate de que el ID esté incluido en los valores

      if (initialValues && !values.password) {
        delete values.password;
      }

      console.log(JSON.stringify(values));

      const response = initialValues
        ? await fetch(`http://localhost:8080/api/v1/users/${values.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // si tu backend requiere token
            },
            body: JSON.stringify(values),
          })
        : await fetch("http://localhost:8080/api/v1/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // si tu backend requiere token
            },
            body: JSON.stringify(values),
          });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error al crear usuario",
          text:
            errorData.message || "Ocurrió un error al registrar el usuario.",
        });
        return; // no resetear formulario si falla
      }

      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: initialValues
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente",
        text: initialValues
          ? "El usuario ha sido actualizado correctamente"
          : "El usuario ha sido registrado exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      onOk(values); // llamar a callback externo si lo necesitas
      form.resetFields(); // limpiar formulario
    } catch (errorInfo) {
      console.log("Validación fallida o error en request:", errorInfo);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={visible}
      title={initialValues ? "Editar Usuario" : "Crear Usuario"}
      onCancel={handleCancel}
      onOk={handleOk}
      okText={initialValues ? "Actualizar" : "Crear"}
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="nombre"
          label="Nombre"
          rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="apellidos"
          label="Apellidos"
          rules={[{ required: true, message: "Por favor ingrese un apellido" }]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Por favor ingrese su username" }]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Contraseña"
          rules={
            initialValues
              ? [] // no obligatorio si estamos editando
              : [{ required: true, message: "Por favor ingrese la contraseña" }]
          }
        >
          <Input.Password
            placeholder={
              initialValues
                ? "Dejar vacío para mantener la contraseña actual"
                : ""
            }
            autoComplete="off"
          />
        </Form.Item>
        <Form.Item
          name="rol"
          label="Rol"
          rules={[{ required: true, message: "Por favor seleccione un rol" }]}
        >
          <Select placeholder="Seleccione un rol">
            <Select.Option value="admin">Administrador</Select.Option>
            <Select.Option value="empleado">Empleado</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalUsuario;
