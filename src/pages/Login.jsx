import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Form, Input, Button } from "antd";
import Swal from "sweetalert2";
import { useMutation } from "@tanstack/react-query";
import { loginEmail } from "../querys/userQuerys";
import logo from "../assets/papeleriaLogo.png";
import logo2 from "../assets/papeleria.png";
import Loader from "../utils/Loader";

export default function Login() {
  const [form] = Form.useForm();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation({
    mutationKey: ["iniciar-sesion"],
    mutationFn: loginEmail,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      login({
        id: data.user.id,
        nombre: `${data.user.nombre} ${data.user.apellidos}`,
        rol: data.user.rol,
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    },
  });

  const handleLogin = async () => {
    try {
      const { username, password } = await form.validateFields();
      mutate({ username, password });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor complete todos los campos",
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      {isLoading && <Loader />}
      <div className="bg-white shadow-lg rounded-xl p-8 w-80">
        <img src={logo} alt="logo" />
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Por favor ingrese su usuario" },
            ]}
          >
            <Input
              placeholder="Nombre de usuario"
              className="w-full p-2 border rounded mb-4"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Por favor ingrese su contraseña" },
            ]}
          >
            <Input.Password
              placeholder="Ingrese su contraseña"
              className="w-full p-2 border rounded mb-4"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              loading={isLoading} // usa el estado de la mutación
            >
              Iniciar sesión
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
