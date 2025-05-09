
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Profile = () => {
  const { user, profile, updateProfile, upgradeAccount } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgradeToPremium = async () => {
    if (profile?.role === "free_user") {
      try {
        await upgradeAccount("premium_user");
      } catch (error) {
        console.error("Error upgrading account:", error);
      }
    }
  };

  const getRoleBadgeColor = () => {
    switch (profile?.role) {
      case "admin":
        return "bg-red-500 text-white";
      case "author":
        return "bg-blue-500 text-white";
      case "premium_user":
        return "bg-amber-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="mb-6 flex items-center">
          <Avatar className="h-24 w-24 mr-4">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name || ""} />
            ) : (
              <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
            )}
          </Avatar>
          
          <div>
            <h2 className="text-2xl font-medium">{profile?.full_name || user?.email}</h2>
            <div className="text-gray-500">{user?.email}</div>
            <Badge className={`mt-2 ${getRoleBadgeColor()}`}>
              {profile?.role === "free_user" ? "Free User" : 
               profile?.role === "premium_user" ? "Premium User" : 
               profile?.role === "author" ? "Author" :
               profile?.role === "admin" ? "Admin" : "Unknown Role"}
            </Badge>
          </div>
        </div>

        {profile?.role === "free_user" && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upgrade your account</AlertTitle>
            <AlertDescription>
              Upgrade to Premium to unlock additional features like bookmarking articles and downloading PDFs.
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleUpgradeToPremium}
              >
                Upgrade to Premium
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                {avatarUrl && (
                  <div className="mt-2">
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      className="w-20 h-20 object-cover rounded-full border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Input
                  id="role"
                  value={profile?.role === "free_user" ? "Free User" : 
                         profile?.role === "premium_user" ? "Premium User" : 
                         profile?.role === "author" ? "Author" :
                         profile?.role === "admin" ? "Admin" : "Unknown"}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
