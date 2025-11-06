import { API_URL } from "./const";

const totalAyer = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/dashboard/totalAyer`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(
      errorData.message || "Error al obtener el total de ayer"
    );
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

const totalMesActual = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/dashboard/totalMes`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(
      errorData.message || "Error al obtener el total del mes"
    );
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

const totalMeses = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/dashboard/totalMeses`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(
      errorData.message || "Error al obtener el total del mes"
    );
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

const getAllVentasEmpleadosByDates = async ({ fechaInicio, fechaFin }) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (fechaInicio) params.append("fechaInicio", fechaInicio);
  if (fechaFin) params.append("fechaFin", fechaFin);

  const res = await fetch(
    `${API_URL}/dashboard/ventasEmpleados?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al traer las ventas");
    error.response = { status: res.status };
    throw error;
  }
  return res.json();
};

export { totalAyer, totalMesActual, totalMeses, getAllVentasEmpleadosByDates };
