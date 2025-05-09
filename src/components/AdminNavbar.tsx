
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const AdminNavbar = () => {
  const { user, profile, signOut } = useAuth();

  const getRoleBadgeColor = () => {
    switch (profile?.role) {
      case "admin":
        return "bg-red-500 text-white";
      case "author":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

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
            <span className="text-sm">
              {profile?.full_name || user.email}
              {profile && (
                <Badge className={`ml-2 ${getRoleBadgeColor()}`}>
                  {profile.role.replace("_", " ")}
                </Badge>
              )}
            </span>
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                Profile
              </Button>
            </Link>
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
