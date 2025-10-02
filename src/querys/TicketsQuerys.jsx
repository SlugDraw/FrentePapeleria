import { API_URL } from "./const";

const getTicketsByIdCaja = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/sales/tickets/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al obtener caja");
  return res.json();
};

const createTicket = async ({ serial, productos, caja, total }) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/sales/ticket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ serial, productos, caja, total }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Error al crear producto");
  }
  return res.json();
};

const getTicketById = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/sales/ticket/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al obtener detalles del ticket");
  return res.json();
};

export { getTicketsByIdCaja, createTicket, getTicketById };
