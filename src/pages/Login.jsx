import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (username.trim() === "") {
      return Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Ingresa tu nombre",
      });
    }
    if (password.trim() === "") {
      return Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Ingresa tu contraseña",
      });
    }
    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: errorData.message || "Error al iniciar sesión",
        });
      }

      const data = await response.json();
      console.log(data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      login(`${data.user.nombre} ${data.user.apellidos}`);
      navigate("/dashboard");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo conectar con el servidor",
      });
      return;
    }
  };

  // Evitar bucles de redirección
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-80">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="password"
          placeholder="Ingrese su contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={handleLogin}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
