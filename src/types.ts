export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  url: string;
  storage_path?: string;
  tags: string[];
  width: number;
  height: number;
  size_kb: number;
  created_at: string;
  likes: number;
  views: number;
  category: string;
}

export interface GalleryStats {
  totalCount: number;
  totalSizeKb: number;
  totalLikes: number;
  totalViews: number;
  categories: { [key: string]: number };
}

export interface SupabaseConfigState {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isConfigured: boolean;
  useLocalFallback: boolean;
}
