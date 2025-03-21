
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PublicRouteProps {
  redirectPath?: string;
}

const PublicRoute = ({ redirectPath = "/" }: PublicRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Show loading state while checking auth
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (user) {
    // User is authenticated, redirect to home page
    return <Navigate to={redirectPath} replace />;
  }

  // User is not authenticated, render the outlet
  return <Outlet />;
};

export default PublicRoute;
