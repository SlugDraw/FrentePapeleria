import { useState } from "react";
import { DatePicker, Button, Space } from "antd";
import dayjs from "dayjs";
import { CalendarOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

const TicketsFilter = ({ onSearch }) => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const handleBuscar = () => {
    if (fechaInicio && fechaFin) {
      onSearch(fechaInicio, fechaFin);
    }
  };
  return (
    <div className="flex flex-wrap gap-2 items-center mt-6 overflow-x-auto justify-center">
      <Space>
        <label className="text-sm font-semibold text-gray-700 mb-1">
          Búsqueda por fecha
        </label>
        <RangePicker
          format="YYYY-MM-DD"
          value={
            fechaInicio && fechaFin ? [dayjs(fechaInicio), dayjs(fechaFin)] : []
          }
          placeholder={["Fecha Inicial", "Fecha Final"]}
          onChange={(dates) => {
            if (dates) {
              setFechaInicio(dates[0].format("YYYY-MM-DD"));
              setFechaFin(dates[1].format("YYYY-MM-DD"));
            } else {
              setFechaInicio("");
              setFechaFin("");
            }
          }}
          disabledDate={(current) => {
            return current && current > dayjs().endOf("day");
          }}
          suffixIcon={<CalendarOutlined />}
        />

        <Button
          type="primary"
          onClick={handleBuscar}
          disabled={!fechaInicio || !fechaFin}
        >
          Buscar
        </Button>
      </Space>
    </div>
  );
};

export default TicketsFilter;
