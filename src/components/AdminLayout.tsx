
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full">
        <AdminNavbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-grow p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileEdit, 
  Plus,
  Home,
  Users,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/lib/supabase";

const AdminSidebar = () => {
  const location = useLocation();
  const { profile } = useAuth();
  
  return (
    <Sidebar className="w-64 border-r">
      <SidebarContent>
        <div className="py-4">
          <ul className="space-y-2 px-3">
            <li>
              <NavLink 
                to="/admin" 
                end
                className={({ isActive }) => 
                  `flex items-center p-2 rounded-md transition-colors ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent"
                  }`
                }
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/new-article" 
                className={({ isActive }) => 
                  `flex items-center p-2 rounded-md transition-colors ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent"
                  }`
                }
              >
                <Plus className="h-5 w-5 mr-3" />
                New Article
              </NavLink>
            </li>
            
            {isAdmin(profile) && (
              <li>
                <NavLink 
                  to="/admin/users" 
                  className={({ isActive }) => 
                    `flex items-center p-2 rounded-md transition-colors ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent"
                    }`
                  }
                >
                  <Users className="h-5 w-5 mr-3" />
                  User Management
                </NavLink>
              </li>
            )}
            
            <li className="pt-4">
              <NavLink 
                to="/" 
                className="flex items-center p-2 rounded-md transition-colors hover:bg-accent"
              >
                <Home className="h-5 w-5 mr-3" />
                View Site
              </NavLink>
            </li>
            
            <li>
              <NavLink 
                to="/profile" 
                className="flex items-center p-2 rounded-md transition-colors hover:bg-accent"
              >
                <Settings className="h-5 w-5 mr-3" />
                My Profile
              </NavLink>
            </li>
          </ul>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminLayout;
