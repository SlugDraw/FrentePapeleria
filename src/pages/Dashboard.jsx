import PieChart from "../components/charts/PieChartDashboard";
import { useAuth } from "../context/Authcontext";
import { use, useEffect, useState, useMemo } from "react";
import NavVentas from "../components/NavVentas";
import ScatterChartVentasMensuales from "../components/charts/ScatterChartVentasMensuales";
import ScatterChartVentasEmpleados from "../components/charts/ScatterChartVentasEmpleados";
import Loader from "../utils/Loader";
import { useQuery } from "@tanstack/react-query";
import {
  totalAyer,
  totalMesActual,
  totalMeses,
  getAllVentasEmpleadosByDates,
} from "../querys/DashboardQuerys";
import Swal from "sweetalert2";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

const { RangePicker } = DatePicker;

dayjs.extend(isBetween);

const Dashboard = () => {
  const { logout, isAuthenticated, user } = useAuth();
  const [filteredData, setFilteredData] = useState([]);

  const [rangoFechas, setRangoFechas] = useState([
    dayjs().subtract(3, "month").startOf("month"),
    dayjs().endOf("month"),
  ]);

  const disabledDate = (current) => {
    return current && current > dayjs().endOf("day");
  };

  const {
    data: totalHoy,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["totalHoy"],
    queryFn: totalAyer,
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
      }
    },
  });

  const {
    data: totalMes,
    isLoading: isLoadingMes,
    error: isErrorMes,
  } = useQuery({
    queryKey: ["totalMes"],
    queryFn: totalMesActual,
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
      }
    },
  });

  const {
    data: dataMeses,
    isLoading: isLoadingMeses,
    error: isErrorMeses,
  } = useQuery({
    queryKey: ["dataMeses"],
    queryFn: totalMeses,
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
      }
    },
  });

  const {
    data: dataVentasEmpleados,
    isLoading: isLoadingVentasEmpleados,
    error: isErrorVentasEmpleados,
    refetch,
  } = useQuery({
    queryKey: ["ventasEmpleadosPorFecha", rangoFechas],
    queryFn: async () => {
      const fechaInicio = rangoFechas[0].format("YYYY-MM-DD");
      const fechaFin = rangoFechas[1].format("YYYY-MM-DD");

      // 1️⃣ Llamada a la API
      const response = await getAllVentasEmpleadosByDates({
        fechaInicio,
        fechaFin,
      });

      const data = response?.data || response;

      setFilteredData(data);

      // 2️⃣ Filtrado por rango (por seguridad, aunque ya venga filtrado)
      const [inicio, fin] = rangoFechas;
      const filtrado = data
        .filter((v) => dayjs(v.fecha).isBetween(inicio, fin, "day", "[]"))
        // 3️⃣ Agrupar ventas por empleado
        .reduce((acc, curr) => {
          const existe = acc.find((a) => a.empleado === curr.empleado);
          if (existe) existe.ventas += curr.ventas;
          else acc.push({ empleado: curr.empleado, ventas: curr.ventas });
          return acc;
        }, []);

      // 4️⃣ (Opcional) Simula tiempo de carga
      await new Promise((res) => setTimeout(res, 500));

      return filtrado;
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
      }
    },
    enabled: rangoFechas.length === 2,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        Swal.fire({
          title: "Sesión expirada",
          text: "Inicia sesión de nuevo",
          icon: "error",
          confirmButtonText: "Aceptar",
        }).then(() => {
          logout();
        });
      }
    }
  }, [error]);

  if (isLoading || isLoadingMes || isLoadingMeses || isLoadingVentasEmpleados)
    return <Loader />;

  return (
    <>
      <div className="p-4 bg-gray-100 min-h-screen w-100%">
        <NavVentas totalHoy={totalHoy.total} totalMes={totalMes.total} />

        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <ScatterChartVentasMensuales data={dataMeses.resultado} />
        </div>
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <div className="p-4 bg-white rounded-2xl shadow-md mt-3">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-grey-700">
                Filtro por fechas
              </h2>
              <RangePicker
                value={rangoFechas}
                onChange={(values) => {
                  setRangoFechas(values);
                  refetch();
                }}
                format="YYYY-MM-DD"
                allowClear={false}
                disabledDate={disabledDate}
              />
            </div>
          </div>
          <PieChart
            filteredData={dataVentasEmpleados}
            loading={isLoadingVentasEmpleados}
          />
          <ScatterChartVentasEmpleados
            data={dataVentasEmpleados}
            datosFiltrados={filteredData}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
