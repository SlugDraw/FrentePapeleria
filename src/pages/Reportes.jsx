import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Download,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { DatePicker, Empty, Spin } from "antd";
import dayjs from "dayjs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Swal from "sweetalert2";
import { getAllTicketsByDates } from "../querys/TicketsQuerys";
import { useAuth } from "../context/Authcontext";
import { formatDashboardNumber } from "../utils/formatDashboardNumber";

const { RangePicker } = DatePicker;
const PAYMENT_COLORS = ["#0f766e", "#f59e0b", "#2563eb", "#db2777", "#64748b"];

const currency = (value) => `$${formatDashboardNumber(value || 0)}`;

const normalizeTickets = (response) => {
  if (Array.isArray(response)) return response;
  return response?.tickets || response?.result || response?.data || [];
};

const Reportes = () => {
  const { logout } = useAuth();
  const [dates, setDates] = useState([dayjs().startOf("month"), dayjs()]);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "reportes",
      dates?.[0]?.format("YYYY-MM-DD"),
      dates?.[1]?.format("YYYY-MM-DD"),
    ],
    queryFn: () =>
      getAllTicketsByDates({
        fechaInicio: dates[0].format("YYYY-MM-DD"),
        fechaFin: dates[1].format("YYYY-MM-DD"),
      }),
    enabled: dates?.length === 2,
  });

  useEffect(() => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      Swal.fire({
        title: "Sesión expirada",
        text: "Inicia sesión de nuevo",
        icon: "error",
        confirmButtonText: "Aceptar",
      }).then(logout);
    }
  }, [error, logout]);

  const tickets = useMemo(() => normalizeTickets(data), [data]);
  const report = useMemo(() => {
    const byDay = new Map();
    const byPayment = new Map();

    tickets.forEach((ticket) => {
      const total = Number(ticket.total) || 0;
      const day = dayjs(ticket.fecha).format("YYYY-MM-DD");
      const payment = ticket.formaDePago || "Sin especificar";
      byDay.set(day, (byDay.get(day) || 0) + total);
      byPayment.set(payment, (byPayment.get(payment) || 0) + total);
    });

    const total = tickets.reduce(
      (sum, ticket) => sum + (Number(ticket.total) || 0),
      0,
    );
    return {
      total,
      average: tickets.length ? total / tickets.length : 0,
      byDay: [...byDay]
        .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
        .map(([fecha, ventas]) => ({
          fecha: dayjs(fecha).format("DD/MM"),
          ventas,
        })),
      byPayment: [...byPayment].map(([formaDePago, ventas]) => ({
        formaDePago,
        ventas,
      })),
    };
  }, [tickets]);

  const exportCsv = () => {
    const rows = tickets.map((ticket) =>
      [
        ticket.serial,
        ticket.fecha,
        ticket.formaDePago || "Sin especificar",
        ticket.total || 0,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const csv = ["Serial,Fecha,Forma de pago,Total", ...rows].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    link.download = `reporte-${dates[0].format("YYYY-MM-DD")}-${dates[1].format("YYYY-MM-DD")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (isLoading)
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Control comercial
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Reportería
            </h1>
            <p className="mt-2 text-slate-500">
              Consulta el rendimiento de ventas por periodo.
            </p>
          </div>
          <button
            onClick={exportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <Download size={17} /> Exportar CSV
          </button>
        </header>

        <section className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <CalendarDays size={18} className="text-teal-700" /> Periodo de
            consulta
          </div>
          <RangePicker
            value={dates}
            onChange={(value) => value && setDates(value)}
            format="DD/MM/YYYY"
            allowClear={false}
            disabledDate={(date) => date && date > dayjs().endOf("day")}
          />
        </section>

        {error ? (
          <p className="rounded-lg bg-red-50 p-4 text-red-700">
            No fue posible cargar la reportería: {error.message}
          </p>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <MetricCard
                icon={<TrendingUp />}
                label="Ventas del periodo"
                value={currency(report.total)}
                accent="teal"
              />
              <MetricCard
                icon={<Receipt />}
                label="Tickets emitidos"
                value={tickets.length.toLocaleString("es-CO")}
                accent="amber"
              />
              <MetricCard
                icon={<BarChart3 />}
                label="Ticket promedio"
                value={currency(report.average)}
                accent="blue"
              />
            </section>

            {tickets.length === 0 ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white py-20">
                <Empty description="No hay ventas en el periodo seleccionado" />
              </div>
            ) : (
              <section className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <ChartPanel
                  title="Ventas por día"
                  icon={<TrendingUp size={18} />}
                >
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={report.byDay}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="fecha"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `$${Math.round(value / 1000)}k`
                        }
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip formatter={(value) => currency(value)} />
                      <Bar
                        dataKey="ventas"
                        name="Ventas"
                        fill="#0f766e"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartPanel>
                <ChartPanel
                  title="Medios de pago"
                  icon={<CreditCard size={18} />}
                >
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={report.byPayment}
                        dataKey="ventas"
                        nameKey="formaDePago"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={4}
                      >
                        {report.byPayment.map((entry, index) => (
                          <Cell
                            key={entry.formaDePago}
                            fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => currency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartPanel>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
};

const MetricCard = ({ icon, label, value, accent }) => (
  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div
      className={`rounded-lg p-3 ${accent === "teal" ? "bg-teal-50 text-teal-700" : accent === "amber" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const ChartPanel = ({ title, icon, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
      {icon}
      {title}
    </h2>
    {children}
  </div>
);

export default Reportes;
