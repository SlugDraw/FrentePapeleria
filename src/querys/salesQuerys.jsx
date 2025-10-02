import { API_URL } from "./const";

const getCajas = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/sales/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al obtener caja");
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
  if (!res.ok) throw new Error("Error al obtener caja");
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
    throw new Error(errorData.message || "Error al abrir caja");
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
  if (!res.ok) throw new Error("Error al obtener caja por ID");
  return res.json();
};

export { getCajas, getCajaByUser, openSale, getCajaById };
