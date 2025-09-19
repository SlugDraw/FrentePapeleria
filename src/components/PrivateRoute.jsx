import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
}
