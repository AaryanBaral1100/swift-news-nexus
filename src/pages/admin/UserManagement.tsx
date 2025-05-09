
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isAdmin } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Eye, MoreVertical, Shield, User, UserCheck, UserMinus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type UserWithProfile = {
  id: string;
  email: string;
  created_at: string;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: 'admin' | 'author' | 'free_user' | 'premium_user';
    created_at: string;
    updated_at: string;
  }
};

const UserManagement = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToChangeRole, setUserToChangeRole] = useState<UserWithProfile | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'author' | 'free_user' | 'premium_user'>('free_user');

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
      
      if (authUsersError) throw authUsersError;
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Combine users with their profiles
      const usersWithProfiles = authUsers.users.map(user => {
        const userProfile = profiles.find(profile => profile.id === user.id);
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          profile: userProfile || {
            id: user.id,
            full_name: null,
            avatar_url: null,
            role: 'free_user',
            created_at: user.created_at,
            updated_at: user.created_at
          }
        };
      });
      
      return usersWithProfiles as UserWithProfile[];
    },
    enabled: isAdmin(profile)
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Delete user from Supabase Auth (this will cascade to profile)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      return userId;
    },
    onSuccess: (userId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'author' | 'free_user' | 'premium_user' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
        
      if (error) throw error;
      return { userId, role };
    },
    onSuccess: ({ userId, role }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Role updated",
        description: `User role has been updated to ${role.replace('_', ' ')}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete);
      setUserToDelete(null);
    }
  };

  const handleChangeRole = (user: UserWithProfile) => {
    setUserToChangeRole(user);
    setNewRole(user.profile.role);
  };

  const confirmChangeRole = () => {
    if (userToChangeRole && newRole) {
      changeRoleMutation.mutate({
        userId: userToChangeRole.id,
        role: newRole
      });
      setUserToChangeRole(null);
    }
  };

  if (!isAdmin(profile)) {
    return (
      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to access user management. Only administrators can manage users.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading users...</div>
      ) : users && users.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                        {user.profile.avatar_url ? (
                          <img 
                            src={user.profile.avatar_url} 
                            alt={user.profile.full_name || ""} 
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <User className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <span>{user.profile.full_name || "Unnamed User"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.profile.role === 'admin' ? "bg-red-500 text-white" :
                        user.profile.role === 'author' ? "bg-blue-500 text-white" :
                        user.profile.role === 'premium_user' ? "bg-amber-500 text-white" :
                        "bg-gray-500 text-white"
                      }
                    >
                      {user.profile.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleChangeRole(user)}>
                          <UserCheck className="mr-2 h-4 w-4" /> Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                          <UserMinus className="mr-2 h-4 w-4" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-600">No users found.</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={userToDelete !== null} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account, profile, and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <AlertDialog open={userToChangeRole !== null} onOpenChange={() => setUserToChangeRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Change the role for {userToChangeRole?.email}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <Label>Select Role</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={newRole === 'free_user' ? 'default' : 'outline'} 
                  onClick={() => setNewRole('free_user')}
                  className="justify-start"
                >
                  <User className="mr-2 h-4 w-4" />
                  Free User
                </Button>
                <Button 
                  variant={newRole === 'premium_user' ? 'default' : 'outline'} 
                  onClick={() => setNewRole('premium_user')}
                  className="justify-start"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Premium User
                </Button>
                <Button 
                  variant={newRole === 'author' ? 'default' : 'outline'} 
                  onClick={() => setNewRole('author')}
                  className="justify-start"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Author
                </Button>
                <Button 
                  variant={newRole === 'admin' ? 'default' : 'outline'} 
                  onClick={() => setNewRole('admin')}
                  className="justify-start"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmChangeRole}>
              Update Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
