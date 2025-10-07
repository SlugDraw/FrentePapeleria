import { API_URL } from "./const";

const getTicketsByIdCaja = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/sales/tickets/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al traer los tickets");
    error.response = { status: res.status };
    throw error;
  }
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
    const error = new Error(errorData.message || "Error al crear el tickets");
    error.response = { status: res.status };
    throw error;
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
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(
      errorData.message || "Error al consultar el ticket"
    );
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

const getTicketsByUserAndDates = async ({ id, fechaInicio, fechaFin }) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (fechaInicio) params.append("fechaInicio", fechaInicio);
  if (fechaFin) params.append("fechaFin", fechaFin);

  const res = await fetch(
    `${API_URL}/sales/ticket/user/${id}?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al traer los tickets");
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

const getAllTicketsByDates = async ({ fechaInicio, fechaFin }) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (fechaInicio) params.append("fechaInicio", fechaInicio);
  if (fechaFin) params.append("fechaFin", fechaFin);

  const res = await fetch(
    `${API_URL}/sales/tickets/admin/all?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al traer los tickets");
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

export {
  getTicketsByIdCaja,
  createTicket,
  getTicketById,
  getTicketsByUserAndDates,
  getAllTicketsByDates,
};
