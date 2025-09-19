import { useState } from "react";
import { Table, Input, Select, Space, Dropdown, Button, message } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import ModalProducto from "../modals/ModalProducto";
import Swal from "sweetalert2";
const { Search } = Input;
const { Option } = Select;

const ProductosTabla = ({ data }) => {
  console.log(data);

  const [productos, setProductos] = useState(data);
  const [nombreFilter, setNombreFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [idEdicion, setIdedicion] = useState(0);

  const handleAddUser = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };
  const handleOk = async (values) => {
    if (editingProduct) {
      setProductos((prev) =>
        prev.map((u) => (u.id === editingProduct.id ? values : u))
      );
    } else {
      setProductos((prev) => [...prev, values]);
    }

    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const filteredData = productos.filter((u) => {
    return u.nombre.toLowerCase().includes(nombreFilter.toLowerCase());
  });
  const handleDelete = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const url = `http://localhost:8080/api/v1/products/${id}`;

          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error al eliminar producto:", errorData);
            console.error("Error al eliminar producto");
            return;
          }

          setProductos((prev) => prev.filter((u) => u.id !== id));
          Swal.fire({
            icon: "success",
            title: "Producto eliminado correctamente",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Error en la petición:", error);
          console.error("Error al eliminar producto");
        }
      }
    });
  };

  const columns = [
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Precio", dataIndex: "precio", key: "precio" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
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
                  const productToEdit = productos.find(
                    (p) => p.nombre === record.nombre
                  );
                  setEditingProduct(productToEdit);
                  setModalVisible(true);
                },
              },
              {
                key: "2",
                label: <span style={{ color: "red" }}>Eliminar</span>,
                onClick: () => {
                  const productToEdit = productos.find(
                    (p) => p.nombre === record.nombre
                  );
                  console.log(productToEdit);

                  handleDelete(productToEdit.id);
                },
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
            placeholder="Filtrar por nombre"
            value={nombreFilter}
            onChange={(e) => setNombreFilter(e.target.value)}
            style={{ width: 200 }}
          />
        </Space>

        <Button type="primary" onClick={handleAddUser}>
          Agregar producto
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="nombre"
        pagination={{ pageSize: 10 }}
      />

      <ModalProducto
        visible={modalVisible}
        onCancel={handleCancel}
        onOk={handleOk}
        initialValues={editingProduct}
        idEdicion={idEdicion}
      />
    </div>
  );
};

export default ProductosTabla;
