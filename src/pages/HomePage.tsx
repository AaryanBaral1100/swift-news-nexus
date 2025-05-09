
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase, Article, Category } from "@/lib/supabase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const HomePage = () => {
  const { data: featuredArticle, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ["featuredArticle"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          category:category_id (
            id, name, slug
          )
        `)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data as Article & { category: Category };
    },
  });

  const { data: recentArticles, isLoading: isRecentLoading } = useQuery({
    queryKey: ["recentArticles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          category:category_id (
            id, name, slug
          )
        `)
        .order("created_at", { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data as (Article & { category: Category })[];
    },
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*");
      
      if (error) throw error;
      return data as Category[];
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        {/* Hero Section */}
        <section className="mb-12">
          {isFeaturedLoading ? (
            <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg"></div>
          ) : featuredArticle ? (
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={featuredArticle.image_url} 
                alt={featuredArticle.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                <Link 
                  to={`/category/${featuredArticle.category?.slug}`}
                  className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-full mb-2 inline-block"
                >
                  {featuredArticle.category?.name}
                </Link>
                <Link to={`/article/${featuredArticle.slug}`}>
                  <h1 className="text-3xl font-bold text-white mb-2">{featuredArticle.title}</h1>
                </Link>
                <p className="text-gray-200 line-clamp-2">
                  {featuredArticle.content.slice(0, 150)}...
                </p>
                <div className="text-gray-300 text-sm mt-4">
                  {formatDistanceToNow(new Date(featuredArticle.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-500">No featured articles yet.</p>
            </div>
          )}
        </section>

        {/* Recent Articles */}
        <section>
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Recent Articles</h2>
          {isRecentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : recentArticles && recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentArticles.map(article => (
                <Card key={article.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <Link 
                      to={`/category/${article.category?.slug}`}
                      className="text-xs text-primary mb-2 hover:underline"
                    >
                      {article.category?.name}
                    </Link>
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
                  </CardContent>
                  <CardFooter className="text-gray-500 text-sm">
                    {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-500">No articles found.</p>
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 border-b pb-2">Categories</h3>
          {isCategoriesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category.id}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded transition-colors"
                  >
                    <span>{category.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No categories found.</p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default HomePage;
