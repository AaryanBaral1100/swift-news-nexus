
import { createClient } from '@supabase/supabase-js';

// TODO: Replace these with your actual Supabase credentials
// For development purposes only - connect to Supabase properly in production
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

// Comment this check out temporarily for development
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables');
// }

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
