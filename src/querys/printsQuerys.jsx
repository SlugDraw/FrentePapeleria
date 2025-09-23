import { API_URL } from "./const";

const fetchWithTimeout = (url, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout")), timeout);
    fetch(url)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

const mostrarDatosPc = async () => {
  try {
    const response = await fetchWithTimeout(
      "http://localhost:5075/api/get-local-ip",
      5000
    );

    if (!response.ok) {
      throw new Error(`Error de red: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
};

const mostrarListaImpresoraLocales = async () => {
  const response = await fetch("http://localhost:5075/api/list");
  if (!response.ok) {
    return;
  }
  const data = await response.json();
  console.log(data);
  data[data.length] = { name: "seleccione una impresora" };

  return data;
};

const editarImpresoras = async (p) => {
  let url = "";
  let method = "";
  if (p.id == null) {
    url = `${API_URL}/printers/`;
    method = "POST";
  } else {
    url = `${API_URL}/printers/${p.id}`;
    method = "PUT";
  }
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isDirecto: p.state, nombre: p.name }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    const error = new Error(errorData.message || "Error al actualizar usuario");
    error.status = res.status;
    throw error;
  }
  return res.json();
};

const getImpresoras = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/printers/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    return;
  }
  const data = await response.json();
  return data[0];
};

export {
  mostrarDatosPc,
  mostrarListaImpresoraLocales,
  editarImpresoras,
  getImpresoras,
};
