import { Table, Input, Select, Space, Dropdown, Button, message } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import ModalUsuario from "../modals/ModalUsuario";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eliminarUsuario } from "../../querys/userQuerys";
import { useState } from "react";

const { Search } = Input;
const { Option } = Select;

const UsuariosTabla = ({ data }) => {
  const [usernameFilter, setUsernameFilter] = useState("");
  const [rolFilter, setRolFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [idEdicion, setIdedicion] = useState(0);

  const queryClient = useQueryClient();

  const { mutate: deleteUser } = useMutation({
    mutationKey: ["eliminarUsuario"],
    mutationFn: eliminarUsuario,
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] }); // 👈 fuerza refetch
      Swal.fire({
        icon: "success",
        title: `Usuario ${username} eliminado correctamente`,
        showConfirmButton: false,
        timer: 1500,
      });
    },
    onError: (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        Swal.fire("Sesión expirada", "Inicia sesión de nuevo", "error");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        Swal.fire("Error", error.message, "error");
      }
    },
  });

  const handleDelete = (username) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el usuario permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(username);
      }
    });
  };

  data = Array.isArray(data) ? data : data?.content ?? [];
  const rolesUnicos = Array.from(new Set(data.map((u) => u.rol)));

  const filteredData = data.filter((u) => {
    const matchUsername = u.username
      .toLowerCase()
      .includes(usernameFilter.toLowerCase());
    const matchRol = rolFilter ? u.rol === rolFilter : true;
    return matchUsername && matchRol;
  });

  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Rol", dataIndex: "rol", key: "rol" },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "1",
                label: "Editar",
                onClick: () => {
                  setEditingUser(record);
                  setModalVisible(true);
                },
              },
              {
                key: "2",
                label: <span style={{ color: "red" }}>Eliminar</span>,
                onClick: () => handleDelete(record.username),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Space>
          <Search
            placeholder="Filtrar por username"
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filtrar por rol"
            allowClear
            value={rolFilter || undefined}
            onChange={(value) => setRolFilter(value)}
            style={{ width: 180 }}
          >
            <Option value="">Todos</Option>
            {rolesUnicos.map((rol) => (
              <Option key={rol} value={rol}>
                {rol}
              </Option>
            ))}
          </Select>
        </Space>

        <Button type="primary" onClick={() => setModalVisible(true)}>
          Agregar usuario
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="username"
        pagination={{ pageSize: 5 }}
      />

      <ModalUsuario
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          setIdedicion(0);
        }}
        onOk={() => {
          setModalVisible(false), setEditingUser(null);
          setIdedicion(0);
        }}
        initialValues={editingUser}
        idedicion={idEdicion}
      />
    </div>
  );
};

export default UsuariosTabla;
