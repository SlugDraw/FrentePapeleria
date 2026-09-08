import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { Spin } from "antd";
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

const PieChartDashboard = ({ filteredData, loading }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const totalVentas = filteredData.reduce((sum, item) => sum + item.ventas, 0);

  console.log("filteredData en PieChartDashboard:", filteredData);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md mt-4">
      <div className="flex justify-start items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Ventas por empleado (Cajas cerradas)
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin tip="Cargando datos..." />
        </div>
      ) : filteredData.length === 0 ? (
        <p className="text-center text-gray-500 py-16">
          No hay ventas en el rango seleccionado.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={filteredData}
              dataKey="ventas"
              nameKey="empleado"
              cx="50%"
              cy="50%"
              innerRadius={60} // Donut
              outerRadius={100} // Radio normal
              fill="#8884d8"
              paddingAngle={5} // Gap entre porciones
              cornerRadius={10} // Bordes redondeados
              activeIndex={activeIndex} // Porción activa
              activeOuterRadius={120} // Porción activa se agranda
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              isAnimationActive={true} // Animación
              animationDuration={300} // Duración en ms
              label={({ name, value }) =>
                `${name}: $${formatDashboardNumber(value)}`
              }
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            {/* Total en el centro */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: "20px", fontWeight: "bold" }}
            >
              ${formatDashboardNumber(totalVentas)}
            </text>
            <Tooltip
              formatter={(value) => `$${formatDashboardNumber(value)}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PieChartDashboard;
