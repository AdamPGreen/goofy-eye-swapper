
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute = ({ redirectPath = "/auth" }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Show loading state while checking auth
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // User is not authenticated, redirect to auth page
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated, render the outlet
  return <Outlet />;
};

export default ProtectedRoute;
