import { useEffect, useState } from "react";
import DataTableUsuarios from "../components/tables/UsuariosTablas";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/v1/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Error al obtener los usuarios");
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
      </div>
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <DataTableUsuarios data={users} />
        </div>
      )}
    </>
  );
};

export default Users;
