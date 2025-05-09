
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase, Article, Category } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: category, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();
        
      if (error) throw error;
      return data as Category;
    },
    enabled: !!slug,
  });
  
  const { data: articles, isLoading: isArticlesLoading } = useQuery({
    queryKey: ["categoryArticles", slug],
    queryFn: async () => {
      if (!category) return [];
      
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("category_id", category.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data as Article[];
    },
    enabled: !!category,
  });
  
  const isLoading = isCategoryLoading || isArticlesLoading;
  
  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-16 w-3/4 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      </div>
    );
  }
  
  if (!category) {
    return (
      <div className="p-8 bg-gray-100 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
        <p>The category you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="mt-4 inline-block underline">
          Return to homepage
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <header className="mb-8 pb-6 border-b">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 mt-2">{category.description}</p>
        )}
      </header>
      
      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Card key={article.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img 
                  src={article.image_url} 
                  alt={article.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">
                  <Link to={`/article/${article.slug}`} className="hover:text-primary">
                    {article.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-2">
                  {article.content.slice(0, 120)}...
                </p>
                <div className="text-gray-500 text-sm mt-4">
                  {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-8 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-500">No articles in this category yet.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
