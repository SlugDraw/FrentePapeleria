import { useState } from "react";
import { Table, Input, Select, Space, Dropdown, Button, message } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import ModalUsuario from "../modals/ModalUsuario";
import Swal from "sweetalert2";
const { Search } = Input;
const { Option } = Select;

const UsuariosTabla = ({ data }) => {
  const [usuarios, setUsuarios] = useState(data);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [rolFilter, setRolFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [idEdicion, setIdedicion] = useState(0);

  const handleAddUser = () => {
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleOk = async (values) => {
    if (editingUser) {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === editingUser.id ? values : u))
      );
    } else {
      setUsuarios((prev) => [...prev, values]);
    }

    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  // Nuevo hook para eliminar usuario
  const handleDelete = async (username) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el usuario permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const url = `http://localhost:8080/api/v1/users/${username}`;

          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error al eliminar usuario:", errorData);
            message.error("Error al eliminar usuario");
            return;
          }

          setUsuarios((prev) => prev.filter((u) => u.username !== username));
          Swal.fire({
            icon: "success",
            title: "Usuario eliminado correctamente",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Error en la petición:", error);
          message.error("Error al eliminar usuario");
        }
      }
    });
  };

  // Roles únicos
  const rolesUnicos = Array.from(new Set(usuarios.map((u) => u.rol)));

  const filteredData = usuarios.filter((u) => {
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
                  const userToEdit = usuarios.find(
                    (u) => u.username === record.username
                  );
                  setEditingUser(userToEdit);
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

        <Button type="primary" onClick={handleAddUser}>
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
        onCancel={handleCancel}
        onOk={handleOk}
        initialValues={editingUser}
        idedicion={idEdicion}
      />
    </div>
  );
};

export default UsuariosTabla;
