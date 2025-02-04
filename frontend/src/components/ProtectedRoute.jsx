import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-purple-950">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;