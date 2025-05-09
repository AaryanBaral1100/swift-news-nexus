
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Article, Category, isPremiumUser } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, BookmarkCheck, Download, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

// Function to convert article to PDF (for premium users)
const downloadAsPdf = (article: Article) => {
  // In a real implementation, you would generate a PDF
  // For this example, we'll just show a toast
  toast({
    title: "PDF Download",
    description: "Your article has been downloaded as PDF. (This is just a placeholder)",
  });
};

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [isBookmarking, setIsBookmarking] = useState(false);
  
  // Fetch article
  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          category:category_id (
            id, name, slug, description, image_url, color, created_at, updated_at
          ),
          author:author_id (
            id, full_name, avatar_url
          )
        `)
        .eq("slug", slug)
        .single();
        
      if (error) throw error;
      return data as Article;
    },
    enabled: !!slug,
  });
  
  // Check if article is bookmarked by current user
  const { data: isBookmarked = false } = useQuery({
    queryKey: ["bookmark", article?.id, user?.id],
    queryFn: async () => {
      if (!user || !article) return false;
      
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("article_id", article.id)
        .single();
        
      return !!data;
    },
    enabled: !!user && !!article && isPremiumUser(profile),
  });
  
  // Toggle bookmark mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user || !article) return;
      
      setIsBookmarking(true);
      
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("article_id", article.id);
          
        if (error) throw error;
        return false;
      } else {
        // Add bookmark
        const { error } = await supabase
          .from("bookmarks")
          .insert({ user_id: user.id, article_id: article.id });
          
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (newBookmarkStatus) => {
      queryClient.invalidateQueries({ queryKey: ["bookmark", article?.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      
      toast({
        title: newBookmarkStatus ? "Bookmark Added" : "Bookmark Removed",
        description: newBookmarkStatus 
          ? "This article has been added to your bookmarks." 
          : "This article has been removed from your bookmarks.",
      });
      
      setIsBookmarking(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update bookmark status.",
        variant: "destructive",
      });
      
      setIsBookmarking(false);
    }
  });
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-64 w-full rounded-lg mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/4 mb-8" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-red-50 rounded-lg text-red-700">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>Failed to load article. The article may have been removed or the URL is incorrect.</p>
        <Link to="/" className="mt-4 inline-block underline">
          Return to homepage
        </Link>
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="mt-4 inline-block underline">
          Return to homepage
        </Link>
      </div>
    );
  }
  
  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-6">
        <div className="flex justify-between items-start">
          <Link 
            to={`/category/${article.category?.slug}`}
            className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full mb-4 inline-block hover:bg-primary/20 transition-colors"
          >
            {article.category?.name}
          </Link>
          
          {article.is_trending && (
            <Badge variant="outline" className="bg-amber-500 text-white">
              Trending
            </Badge>
          )}
        </div>
        
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              {article.author?.avatar_url ? (
                <img 
                  src={article.author.avatar_url} 
                  alt={article.author.full_name || ""} 
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <User className="h-4 w-4 text-gray-500" />
              )}
            </div>
            <span className="text-gray-600 mr-2">
              {article.author?.full_name || "Unknown Author"}
            </span>
            <span className="text-gray-500">
              {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
            </span>
          </div>
          
          {user && isPremiumUser(profile) && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toggleBookmarkMutation.mutate()}
                disabled={isBookmarking}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2" /> Bookmarked
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" /> Bookmark
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadAsPdf(article)}
              >
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <div className="mb-8">
        <img 
          src={article.image_url} 
          alt={article.title} 
          className="w-full h-auto rounded-lg object-cover max-h-[500px]"
        />
      </div>
      
      <div className="prose prose-lg max-w-none">
        {article.content.split('\n').map((paragraph, i) => (
          <p key={i} className="mb-4">{paragraph}</p>
        ))}
      </div>
    </article>
  );
};

export default ArticlePage;
