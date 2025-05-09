
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase, Category, isAdmin, isAuthor, isPremiumUser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data as Category[];
    }
  });
  
  const handleLoginClick = () => {
    navigate("/login");
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  const userRoleBadge = () => {
    if (!profile) return null;
    
    let color = "";
    switch (profile.role) {
      case "admin":
        color = "bg-red-500";
        break;
      case "author":
        color = "bg-blue-500";
        break;
      case "premium_user":
        color = "bg-amber-500";
        break;
      default:
        color = "bg-gray-500";
    }
    
    return (
      <Badge variant="outline" className={`ml-2 ${color} text-white`}>
        {profile.role.replace("_", " ")}
      </Badge>
    );
  };
  
  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="text-2xl font-bold text-primary">NewsPortal</Link>
        
        {isMobile ? (
          <>
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
            
            {isMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-white shadow-md py-4 px-4">
                <nav>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/" className="block py-2 hover:text-primary" onClick={toggleMenu}>
                        Home
                      </Link>
                    </li>
                    {categories?.map((category) => (
                      <li key={category.id}>
                        <Link 
                          to={`/category/${category.slug}`} 
                          className="block py-2 hover:text-primary"
                          onClick={toggleMenu}
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                    
                    {user ? (
                      <>
                        {(isAdmin(profile) || isAuthor(profile)) && (
                          <li>
                            <Link to="/admin" className="block py-2 hover:text-primary" onClick={toggleMenu}>
                              Admin
                            </Link>
                          </li>
                        )}
                        
                        {isPremiumUser(profile) && (
                          <li>
                            <Link to="/bookmarks" className="block py-2 hover:text-primary" onClick={toggleMenu}>
                              My Bookmarks
                            </Link>
                          </li>
                        )}
                        
                        <li>
                          <Link to="/profile" className="block py-2 hover:text-primary" onClick={toggleMenu}>
                            My Profile {userRoleBadge()}
                          </Link>
                        </li>
                        
                        <li>
                          <button 
                            className="block py-2 hover:text-primary w-full text-left" 
                            onClick={() => {
                              handleSignOut();
                              toggleMenu();
                            }}
                          >
                            Sign Out
                          </button>
                        </li>
                      </>
                    ) : (
                      <li>
                        <Link to="/login" className="block py-2 hover:text-primary" onClick={toggleMenu}>
                          Login / Register
                        </Link>
                      </li>
                    )}
                  </ul>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Home
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {categories?.map((category) => (
                        <ListItem
                          key={category.id}
                          title={category.name}
                          href={`/category/${category.slug}`}
                        >
                          {category.description || `All ${category.name} articles`}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                {(isAdmin(profile) || isAuthor(profile)) && (
                  <NavigationMenuItem>
                    <Link to="/admin" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      Admin
                    </Link>
                  </NavigationMenuItem>
                )}
                
                {isPremiumUser(profile) && (
                  <NavigationMenuItem>
                    <Link to="/bookmarks" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      My Bookmarks
                    </Link>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2">
                    <User className="h-4 w-4 mr-2" />
                    {profile?.full_name || user.email}
                    {userRoleBadge()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLoginClick} size="sm">
                Login
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default Navbar;
