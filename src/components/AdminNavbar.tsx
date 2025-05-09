
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const AdminNavbar = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 border-b bg-white flex items-center px-4">
      <div className="flex-1 flex items-center">
        <SidebarTrigger className="mr-4" />
        <Link to="/admin" className="font-bold text-lg">
          NewsPortal Admin
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </>
        ) : (
          <Link to="/login">
            <Button size="sm">Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default AdminNavbar;
