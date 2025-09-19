import { useEffect, useState } from "react";
import DataTableProductos from "../components/tables/ProductosTabla";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/v1/products", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al obtener productos");

        const data = await res.json();
        setProductos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/v1/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, precio, stock }),
      });

      if (!res.ok) throw new Error("Error al agregar producto");

      const newProduct = await res.json();
      setProductos([...productos, newProduct]);
      setShowForm(false);
      setNombre("");
      setPrecio("");
      setStock("");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
        </div>
      </div>

      {loading ? (
        <p className="mt-6">Cargando productos...</p>
      ) : error ? (
        <p className="mt-6 text-red-500">Error: {error}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <DataTableProductos data={productos} />
        </div>
      )}
    </div>
  );
};

export default Productos;
