
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NewArticle from "./pages/admin/NewArticle";
import EditArticle from "./pages/admin/EditArticle";
import UserManagement from "./pages/admin/UserManagement";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Bookmarks from "./pages/Bookmarks";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/bookmarks" element={
                <ProtectedRoute>
                  <Bookmarks />
                </ProtectedRoute>
              } />
            </Route>
            
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="new-article" element={<NewArticle />} />
              <Route path="edit-article/:id" element={<EditArticle />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
