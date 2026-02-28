import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRole && user?.role !== allowedRole) {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin" : "/employee"}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;