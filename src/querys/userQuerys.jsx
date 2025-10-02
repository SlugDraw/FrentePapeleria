import { API_URL } from "./const";

const loginEmail = async ({ username, password }) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Error al iniciar sesión");
  }

  return res.json();
};

const listarUsuarios = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/users/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const error = new Error("Error al obtener los usuarios");
    error.status = res.status;
    throw error;
  }

  return res.json();
};

const eliminarUsuario = async (username) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/users/${username}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al eliminar usuario");
    error.status = res.status;
    throw error;
  }
  return true;
};

const crearUsuario = async (values) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al crear usuario");
    error.status = res.status;
    throw error;
  }
  return res.json();
};

const actualizarUsuario = async ({ id, ...values }) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al actualizar usuario");
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export {
  loginEmail,
  listarUsuarios,
  eliminarUsuario,
  crearUsuario,
  actualizarUsuario,
};
