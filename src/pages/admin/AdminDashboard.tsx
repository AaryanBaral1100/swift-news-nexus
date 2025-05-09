
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Article, Category } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);
  
  const { data: articlesWithCategory, isLoading } = useQuery({
    queryKey: ["articles", "admin"],
    queryFn: async () => {
      const { data: articles, error } = await supabase
        .from("articles")
        .select(`
          *,
          category:category_id (
            id, name
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return articles as (Article & { category: Category })[];
    },
  });
  
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast({
        title: "Article deleted",
        description: "The article has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete article.",
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = (id: number) => {
    setArticleToDelete(id);
  };
  
  const confirmDelete = () => {
    if (articleToDelete !== null) {
      deleteArticleMutation.mutate(articleToDelete);
      setArticleToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setArticleToDelete(null);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Articles Management</h1>
        <Link to="/admin/new-article">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Article
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="text-center p-8">Loading articles...</div>
      ) : articlesWithCategory && articlesWithCategory.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articlesWithCategory.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {article.title}
                  </TableCell>
                  <TableCell>{article.category?.name || "Uncategorized"}</TableCell>
                  <TableCell>
                    {format(new Date(article.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {article.is_featured ? (
                      <Badge variant="default">Featured</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/edit-article/${article.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-600">No articles found.</p>
          <p className="mt-2">
            <Link to="/admin/new-article" className="text-primary underline">
              Create your first article
            </Link>
          </p>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={articleToDelete !== null} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the article.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
