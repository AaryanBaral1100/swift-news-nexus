
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase, Bookmark, isPremiumUser } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Bookmark as BookmarkIcon, X, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Bookmarks = () => {
  const { user, profile } = useAuth();

  const { data: bookmarks, isLoading, refetch } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("bookmarks")
        .select(`
          *,
          article:article_id (
            id, title, slug, content, image_url, created_at,
            category:category_id (
              id, name, slug
            )
          )
        `)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data as Bookmark[];
    },
    enabled: !!user && isPremiumUser(profile),
  });

  const removeBookmark = async (bookmarkId: number) => {
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmarkId);
        
      if (error) throw error;
      
      toast({
        title: "Bookmark removed",
        description: "The article has been removed from your bookmarks.",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove bookmark.",
        variant: "destructive",
      });
    }
  };
  
  if (!isPremiumUser(profile)) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Premium Feature</AlertTitle>
          <AlertDescription>
            Bookmarks are only available for premium users. Please upgrade your account to access this feature.
            <Link to="/profile">
              <Button variant="outline" size="sm" className="mt-2">
                Upgrade to Premium
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-pulse"></div>
              <CardHeader>
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookmarks && bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map(bookmark => (
            <Card key={bookmark.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img 
                  src={bookmark.article?.image_url || 'https://via.placeholder.com/640x360?text=No+Image'} 
                  alt={bookmark.article?.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">
                  <Link to={`/article/${bookmark.article?.slug}`} className="hover:text-primary">
                    {bookmark.article?.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link 
                  to={`/category/${bookmark.article?.category?.slug}`}
                  className="text-xs text-primary mb-2 hover:underline"
                >
                  {bookmark.article?.category?.name}
                </Link>
                <p className="text-gray-600 line-clamp-2 mt-2">
                  {bookmark.article?.content.slice(0, 120)}...
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="text-gray-500 text-sm">
                  {bookmark.article?.created_at && 
                    formatDistanceToNow(new Date(bookmark.article.created_at), { addSuffix: true })}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeBookmark(bookmark.id)}
                >
                  <X className="h-4 w-4 mr-2" /> Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">No bookmarks yet</h2>
          <p className="text-gray-600 mb-4">
            Start bookmarking articles you'd like to read later.
          </p>
          <Link to="/">
            <Button>Browse Articles</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
