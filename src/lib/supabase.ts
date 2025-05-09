
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Use the Supabase client from the integration
import { supabase as supabaseClient } from '@/integrations/supabase/client';

export const supabase = supabaseClient;

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  role: 'admin' | 'author' | 'free_user' | 'premium_user';
};

export type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url: string | null;
  is_featured: boolean;
  is_trending: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
  category_id: number | null;
  category?: Category;
  author?: Profile;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export type Bookmark = {
  id: number;
  user_id: string;
  article_id: number;
  created_at: string;
  article?: Article;
};

// Helper functions for user roles
export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin';
}

export function isAuthor(profile: Profile | null): boolean {
  return profile?.role === 'author' || profile?.role === 'admin';
}

export function isPremiumUser(profile: Profile | null): boolean {
  return profile?.role === 'premium_user' || profile?.role === 'admin';
}
