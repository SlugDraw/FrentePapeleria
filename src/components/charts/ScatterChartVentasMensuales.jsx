import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { formatDashboardNumber } from "../../utils/formatDashboardNumber";

dayjs.locale("es");

const ScatterChartVentasMensuales = ({ data }) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Ventas Totales por Mes (Tikets vendidos)
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="mes"
            tickFormatter={(fecha) => dayjs(fecha).format("MMMM - YYYY")}
            type="category"
            name="Mes"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            dataKey="total"
            type="number"
            name="Total Vendido"
            tickFormatter={(value) => `$${formatDashboardNumber(value)}`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value) => `$${formatDashboardNumber(value)}`}
          />
          <Legend />
          <Scatter
            name="Ventas"
            data={data}
            fill="#0088FE"
            line={{ stroke: "#00C49F", strokeWidth: 2 }}
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChartVentasMensuales;
