import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import Loader from "../utils/Loader";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <Loader />; // o spinner
  }
  return isAuthenticated ? children : <Navigate to="/" replace />;
}
