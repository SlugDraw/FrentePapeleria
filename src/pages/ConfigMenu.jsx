import {
  LayoutDashboard,
  User,
  NotebookText,
  HandCoins,
  FileBarChart,
} from "lucide-react";

export const configMenu = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "gerente", "empleado"],
  },
  {
    label: "Reportería",
    path: "/reportes",
    icon: FileBarChart,
    roles: ["admin", "gerente"],
  },
  {
    label: "Caja",
    path: "/caja",
    icon: HandCoins,
    roles: ["admin", "gerente", "empleado"],
    children: [
      {
        label: "Abrir caja",
        path: "/caja",
      },
      {
        label: "Consultar tickets",
        path: "/caja/tickets",
      },
    ],
  },
  {
    label: "Usuarios",
    path: "/usuarios",
    icon: User,
    roles: ["admin", "gerente"],
  },
  {
    label: "Productos",
    path: "/productos",
    icon: NotebookText,
    roles: ["admin", "gerente"],
  },
];
