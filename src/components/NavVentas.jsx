import { CalendarDays, DollarSign } from "lucide-react";
import { formatDashboardNumber } from "../utils/formatDashboardNumber";

const NavVentas = ({ totalHoy, totalMes }) => {
  return (
    <nav className="w-full bg-white shadow-sm px-6 py-3 flex justify-between items-center rounded-lg">
      <h1 className="text-xl font-bold text-gray-800">📊 Dashboard</h1>

      <div className="flex gap-6">
        {/* Total vendido hoy */}
        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-2xl shadow-sm">
          <DollarSign className="text-green-600" size={18} />
          <div>
            <p className="text-xs text-gray-500">
              Total Ayer (Tickets vendidos)
            </p>
            <p className="text-lg font-semibold text-green-700">
              ${formatDashboardNumber(totalHoy)}
            </p>
          </div>
        </div>

        {/* Total vendido mes */}
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl shadow-sm">
          <CalendarDays className="text-blue-600" size={18} />
          <div>
            <p className="text-xs text-gray-500">
              Total Mes (Tickets vendidos)
            </p>
            <p className="text-lg font-semibold text-blue-700">
              ${formatDashboardNumber(totalMes)}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavVentas;
