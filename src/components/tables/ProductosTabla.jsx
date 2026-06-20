import { useState } from "react";
import { Table, Input, Space, Dropdown, Button, Tag } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import ModalProducto from "../modals/ModalProducto";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eliminarProducto } from "../../querys/productQuerys";
import { useAuth } from "../../context/Authcontext";
import TicketCode from "../../tickets/TicketCode";
import DownloadCode from "../../tickets/DowloadCode";

const { Search } = Input;

const ProductosTabla = ({ data }) => {
  const [nombreFilter, setNombreFilter] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const getColorSemaforo = (stock, min, max) => {
    if (min === 0 && max === 0) return "orange";
    if (stock <= min) return "red";
    if (stock >= max) return "green";
    return "yellow";
  };

  const getEstado = (stock, min, max) => {
    if (min === 0 && max === 0) return "NO CONFIGURADO";
    if (stock <= min) return "BAJO";
    if (stock >= max) return "ALTO";
    return "OK";
  };

  const getPrioridad = (stock, min, max) => {
    if (min === 0 && max === 0) return 0;
    if (stock <= min) return 1;
    if (stock >= max) return 3;
    return 2;
  };

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
        Swal.fire({
          title: "Sesión expirada",
          text: "Inicia sesión de nuevo",
          icon: "error",
          confirmButtonText: "Aceptar",
        }).then(() => {
          logout();
        });
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
    u.nombre.toUpperCase().includes(nombreFilter.toUpperCase()),
  );

  const columns = [
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      render: (text) => (text ? text.toUpperCase() : ""),
    },
    { title: "Precio", dataIndex: "precio", key: "precio" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
    {
      title: "Estado",
      key: "estado",
      sorter: (a, b) =>
        getPrioridad(a.stock, a.minStock, a.maxStock) -
        getPrioridad(b.stock, b.minStock, b.maxStock),
      defaultSortOrder: "ascend",
      render: (_, record) => {
        const color = getColorSemaforo(
          record.stock,
          record.minStock,
          record.maxStock,
        );

        const estado = getEstado(
          record.stock,
          record.minStock,
          record.maxStock,
        );

        return <Tag color={color}>{estado}</Tag>;
      },
    },
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
                onClick: () => TicketCode(record.code),
              },
              {
                key: "3",
                label: "Descargar código",
                onClick: () => DownloadCode(record.code, record.descripcion),
              },
              {
                key: "4",
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
