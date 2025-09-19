import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/Authcontext";
import Sidebar from "./components/SideBar";
import Layout from "./components/Layout";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Sidebar />
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}
