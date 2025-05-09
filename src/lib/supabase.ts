
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  is_featured: boolean;
  created_at: string;
  category_id: number;
  category?: Category;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  color?: string;
};
