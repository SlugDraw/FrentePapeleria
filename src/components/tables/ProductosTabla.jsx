import { useState } from "react";
import { Table, Input, Space, Dropdown, Button } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import ModalProducto from "../modals/ModalProducto";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eliminarProducto } from "../../querys/productQuerys";

const { Search } = Input;

const ProductosTabla = ({ data }) => {
  const [nombreFilter, setNombreFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const queryClient = useQueryClient();

  // Mutación para eliminar
  const { mutate: deleteProduct } = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => {
      queryClient.invalidateQueries(["productos"]);
      Swal.fire({
        icon: "success",
        title: "Producto eliminado",
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
        Swal.fire({ icon: "error", title: "Error", text: error.message });
      }
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) deleteProduct(id);
    });
  };

  const filteredData = data.filter((u) =>
    u.nombre.toLowerCase().includes(nombreFilter.toLowerCase())
  );

  const columns = [
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Descripción", dataIndex: "descripcion", key: "descripcion" },
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
                  setEditingProduct(record);
                  setModalVisible(true);
                },
              },
              {
                key: "2",
                label: "Imprimir código",
                onClick: () => console.log(record.code),
              },
              {
                key: "3",
                label: <span style={{ color: "red" }}>Eliminar</span>,
                onClick: () => handleDelete(record.id),
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
        <Search
          placeholder="Filtrar por nombre"
          value={nombreFilter}
          onChange={(e) => setNombreFilter(e.target.value)}
          style={{ width: 200 }}
        />

        <Button type="primary" onClick={() => setModalVisible(true)}>
          Agregar producto
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <ModalProducto
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingProduct(null);
        }}
        onOk={() => {
          setModalVisible(false);
          setEditingProduct(null);
        }}
        initialValues={editingProduct}
      />
    </div>
  );
};

export default ProductosTabla;
