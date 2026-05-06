import { API_URL } from "./const";

const listarProductos = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/products`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al obtener productos");
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

const crearProducto = async ({
  code,
  nombre,
  descripcion,
  precio,
  stock,
  minStock,
  maxStock,
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      code,
      nombre,
      descripcion,
      precio,
      stock,
      minStock,
      maxStock,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al crear producto");
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

const actualizarProducto = async ({
  id,
  code,
  nombre,
  descripcion,
  precio,
  stock,
  minStock,
  maxStock,
}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      code,
      nombre,
      descripcion,
      precio,
      stock,
      minStock,
      maxStock,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(
      errorData.message || "Error al actualizar producto",
    );
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

const eliminarProducto = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al eliminar producto");
    error.response = { status: res.status };
    throw error;
  }
  return { id };
};

export { listarProductos, crearProducto, actualizarProducto, eliminarProducto };
