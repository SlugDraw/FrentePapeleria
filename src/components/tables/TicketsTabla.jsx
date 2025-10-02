import { Table, Dropdown, Button } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ModalTicketsDetail from "../modals/ModalTicketsDetail";
import { useState } from "react";

const TicketTabla = ({ data }) => {
  const [visible, setVisible] = useState(false);
  const [venta, setVenta] = useState(null);

  const columns = [
    { title: "Serial", dataIndex: "serial", key: "serial" },
    {
      title: "Hora de la venta",
      dataIndex: "fecha",
      key: "fecha",
      render: (value) => {
        const fecha = new Date(value);
        return fecha.toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    { title: "Total", dataIndex: "total", key: "total" },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "1",
                label: "Detalle",
                onClick: () => {
                  setVenta(record);
                  setVisible(true);
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
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <ModalTicketsDetail
        visible={visible}
        onCancel={() => {
          setVisible(false);
          setVenta(null);
        }}
        venta={venta}
      />
    </div>
  );
};

export default TicketTabla;
