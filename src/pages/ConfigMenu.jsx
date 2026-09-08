import { LayoutDashboard, User, NotebookText, HandCoins } from "lucide-react";

export const configMenu = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "gerente", "empleado"],
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
