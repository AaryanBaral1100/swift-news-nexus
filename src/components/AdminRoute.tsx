
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { isAdmin, isAuthor } from "@/lib/supabase";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="w-1/2 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-8 w-5/6" />
        </div>
      </div>
    );
  }

  // Check if user has admin or author role
  if (!user || !profile || (!isAdmin(profile) && !isAuthor(profile))) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
