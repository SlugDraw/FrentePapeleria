import { API_URL } from "./const";

const getCajas = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/sales/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al obtener las cajas");
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

const getCajaByUser = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/sales/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al obtener las cajas");
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

const openSale = async ({ id, apertura }) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/sales/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ usuario: id, apertura }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al abrir al caja");
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

const getCajaById = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/sales/open/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al obtener la caja");
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

const closeSales = async ({ idCaja, totalVenta }) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/sales/close/${idCaja}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ totalVenta: totalVenta }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al cerrar la caja");
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

export { getCajas, getCajaByUser, openSale, getCajaById, closeSales };
