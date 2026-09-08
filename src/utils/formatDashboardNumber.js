const formatDashboardNumber = (value) =>
  Number(value ?? 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export { formatDashboardNumber };
