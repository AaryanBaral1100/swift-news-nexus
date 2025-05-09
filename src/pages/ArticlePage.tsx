
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase, Article, Category } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          category:category_id (
            id, name, slug
          )
        `)
        .eq("slug", slug)
        .single();
        
      if (error) throw error;
      return data as Article & { category: Category };
    },
    enabled: !!slug,
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
        <Link 
          to={`/category/${article.category?.slug}`}
          className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full mb-4 inline-block hover:bg-primary/20 transition-colors"
        >
          {article.category?.name}
        </Link>
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="text-gray-500">
          {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
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
