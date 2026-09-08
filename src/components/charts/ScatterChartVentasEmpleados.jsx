import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { formatDashboardNumber } from "../../utils/formatDashboardNumber";

dayjs.extend(isBetween);

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28EFF",
  "#FF66B2",
  "#00B8D9",
  "#FFD666",
  "#36B37E",
  "#F15BB5",
];

const ScatterChartVentasEmpleados = ({ data, datosFiltrados }) => {
  const ventasPorMes = useMemo(() => {
    const agrupado = {};
    datosFiltrados.forEach(({ empleado, fecha, ventas }) => {
      const mes = dayjs(fecha).format("YYYY-MM");
      if (!agrupado[mes]) agrupado[mes] = { mes };
      agrupado[mes][empleado] = (agrupado[mes][empleado] || 0) + ventas;
    });
    return Object.values(agrupado).sort((a, b) => (a.mes > b.mes ? 1 : -1));
  }, [datosFiltrados]);

  const empleados = [...new Set(data.map((d) => d.empleado))];

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md mt-3">
      <div className="mb-4 flex items-center justify-start">
        <h2 className="text-lg font-semibold">
          Ventas mensuales por empleado (Cajas cerradas)
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={ventasPorMes}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="mes"
            tickFormatter={(m) => dayjs(m).format("MMM YYYY")}
          />
          <YAxis
            tickFormatter={(value) => `$${formatDashboardNumber(value)}`}
          />
          <Tooltip
            formatter={(value) => `$${formatDashboardNumber(value)}`}
            labelFormatter={(label) => dayjs(label).format("MMMM YYYY")}
          />
          <Legend />
          {empleados.map((emp, i) => (
            <Line
              key={emp}
              type="monotone"
              dataKey={emp}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChartVentasEmpleados;
