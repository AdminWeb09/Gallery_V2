/// <reference types="vite/client" />

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { GalleryItem, GalleryStats, SupabaseConfigState } from '../types';

// Default pre-loaded gallery items (high contrast, beautiful photography)
const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'photo-1',
    title: 'Modern Concrete Villa',
    description: 'A minimalist architectural masterpiece blending brutalism with rich natural vegetation, designed for seamless indoor-outdoor living.',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    tags: ['Architecture', 'Brutalism', 'Luxury', 'Interior'],
    width: 1200,
    height: 800,
    size_kb: 342,
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 days ago
    likes: 84,
    views: 412,
    category: 'Architecture'
  },
  {
    id: 'photo-2',
    title: 'Warm Editorial Living Area',
    description: 'A beautifully balanced living space styled with neutral tones, linen textures, premium woodcraft, and soft diffused morning light.',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    tags: ['Interior', 'Minimalist', 'Cozy', 'Warm'],
    width: 1200,
    height: 800,
    size_kb: 215,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    likes: 56,
    views: 289,
    category: 'Interior'
  },
  {
    id: 'photo-3',
    title: 'Ethereal Glass Orbs',
    description: 'Abstract 3D rendering featuring translucent glass spheres interacting with organic shapes and pastel pink gradient backdrops.',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    tags: ['Abstract', 'CGI', 'Glass', 'Gradient'],
    width: 1200,
    height: 800,
    size_kb: 489,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
    likes: 129,
    views: 654,
    category: 'Abstract'
  },
  {
    id: 'photo-4',
    title: 'Alpine Morning Reflection',
    description: 'Serene mountain waters reflecting a towering glacier in the Canadian Rockies under a misty, golden dawn sky.',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    tags: ['Nature', 'Landscape', 'Mountains', 'Dawn'],
    width: 1200,
    height: 800,
    size_kb: 512,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    likes: 95,
    views: 310,
    category: 'Nature'
  },
  {
    id: 'photo-5',
    title: 'Shibuya Midnight Transit',
    description: 'Vibrant neon light trails and high-speed motion capture highlighting the futuristic cyberpunk energy of Tokyo at night.',
    url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=1200&q=80',
    tags: ['City', 'Cyberpunk', 'Neon', 'Japan'],
    width: 1200,
    height: 800,
    size_kb: 618,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    likes: 214,
    views: 899,
    category: 'City'
  },
  {
    id: 'photo-6',
    title: 'The Minimalist Creator Workspace',
    description: 'An inspiring developer studio showcasing high-performance hardware, ultra-clean cable organization, and warm ergonomic task lighting.',
    url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80',
    tags: ['Workstation', 'Tech', 'Minimalist', 'Setup'],
    width: 1200,
    height: 800,
    size_kb: 295,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(), // 6 hours ago
    likes: 47,
    views: 180,
    category: 'Tech'
  }
];

// Read Supabase config from env or fallback to your project credentials as standard default
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pkoribfxgybwzgbtgnke.supabase.co';
const ENV_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrb3JpYmZ4Z3lid3pnYnRnbmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NzQ3MzEsImV4cCI6MjA5NTI1MDczMX0.GM0-yO0MKypz0NEmntI6K0d6tKKCb-0DunJ6JWx6DQY';

// Manage configuration state
let currentConfig: SupabaseConfigState = {
  url: ENV_URL,
  anonKey: ENV_KEY,
  isConnected: false,
  isConfigured: !!(ENV_URL && ENV_KEY),
  useLocalFallback: !ENV_URL || !ENV_KEY || !ENV_URL.includes('supabase.co')
};

// Initialize Supabase Client if configured
let supabaseInstance: SupabaseClient | null = null;

function tryInitializeSupabase(): boolean {
  if (currentConfig.url && currentConfig.anonKey && currentConfig.url.includes('supabase.co')) {
    try {
      supabaseInstance = createClient(currentConfig.url, currentConfig.anonKey, {
        auth: { persistSession: true }
      });
      currentConfig.isConfigured = true;
      currentConfig.isConnected = true;
      currentConfig.useLocalFallback = false;
      return true;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      currentConfig.isConnected = false;
      currentConfig.useLocalFallback = true;
    }
  } else {
    currentConfig.isConfigured = false;
    currentConfig.isConnected = false;
    currentConfig.useLocalFallback = true;
  }
  return false;
}

// Perform initial setup check
tryInitializeSupabase();

// Event hooks for real-time emulation
type UpdateCallback = (items: GalleryItem[]) => void;
const subscribers = new Set<UpdateCallback>();

function emitUpdate(items: GalleryItem[]) {
  subscribers.forEach((cb) => cb(items));
}

// Local Storage simulation DB setup
const LOCAL_STORAGE_KEY = 'serverless_gallery_items';
function getLocalItems(): GalleryItem[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_GALLERY_ITEMS));
    return INITIAL_GALLERY_ITEMS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_GALLERY_ITEMS;
  }
}

function saveLocalItems(items: GalleryItem[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  emitUpdate(items);
}

// Public API
export const galleryApi = {
  // Get current state of config
  getConfig(): SupabaseConfigState {
    return { ...currentConfig };
  },

  // Save config changes from UI (Deprecated: environment variables are loaded directly from local .env)
  saveConfig(url: string, anonKey: string, useLocalFallback: boolean): SupabaseConfigState {
    return { ...currentConfig };
  },

  // Fetch all gallery items
  async getItems(): Promise<GalleryItem[]> {
    if (supabaseInstance && !currentConfig.useLocalFallback) {
      try {
        const { data, error } = await supabaseInstance
          .from('gallery_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          return data as GalleryItem[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local DB:', err);
      }
    }
    
    // Local DB Fallback
    const items = getLocalItems();
    // Sort descending by created_at
    return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Upload item (handles file processing and insertion)
  async uploadItem(payload: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    file: File | null;
    imageUrl?: string; // Fallback URL if creating item by link
  }): Promise<GalleryItem> {
    const defaultWidth = 1200;
    const defaultHeight = 800;
    const defaultSize = payload.file ? Math.round(payload.file.size / 1024) : 150;
    
    let finalUrl = payload.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
    let storagePath = undefined;

    // Convert File to base64 if local fallback, or upload to Supabase storage if connected
    if (payload.file) {
      if (supabaseInstance && !currentConfig.useLocalFallback) {
        try {
          const fileExt = payload.file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 11)}-${Date.now()}.${fileExt}`;
          storagePath = `uploads/${fileName}`;

          const s3AccessKey = import.meta.env.VITE_SUPABASE_S3_ACCESS_KEY_ID;
          const s3SecretKey = import.meta.env.VITE_SUPABASE_S3_SECRET_ACCESS_KEY;

          if (s3AccessKey && s3SecretKey) {
            console.log('Using robust AWS S3 protocol for upload...');
            const region = import.meta.env.VITE_SUPABASE_S3_REGION || 'us-east-1';
            const projectRef = getProjectRef();
            const s3Client = new S3Client({
              endpoint: `https://${projectRef}.storage.supabase.co/storage/v1/s3`,
              region,
              credentials: {
                accessKeyId: s3AccessKey,
                secretAccessKey: s3SecretKey,
              },
              forcePathStyle: true,
            });

            const uint8Array = await fileToUint8Array(payload.file);
            const command = new PutObjectCommand({
              Bucket: 'gallery',
              Key: storagePath,
              Body: uint8Array,
              ContentType: payload.file.type || 'image/jpeg',
            });

            await s3Client.send(command);
            
            // Public URL is constructed standardly from supabase public storage path
            finalUrl = `${currentConfig.url}/storage/v1/object/public/gallery/${storagePath}`;
            console.log('S3 Protocol upload complete. Public URL:', finalUrl);
          } else {
            console.log('S3 Credentials missing in env. Performing direct HTTP upload to bypass multipart issues...');
            // Highly robust binary upload directly to Supabase storage REST API
            const projectRef = getProjectRef();
            const putUrl = `https://${projectRef}.supabase.co/storage/v1/object/gallery/${storagePath}`;
            const uploadResponse = await fetch(putUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${currentConfig.anonKey}`,
                'x-upsert': 'true',
              },
              body: payload.file
            });

            if (!uploadResponse.ok) {
              const errText = await uploadResponse.text();
              throw new Error(`Direct HTTP upload failed with status ${uploadResponse.status}: ${errText}`);
            }

            // Public URL
            finalUrl = `${currentConfig.url}/storage/v1/object/public/gallery/${storagePath}`;
            console.log('Direct HTTP upload successful! Public URL:', finalUrl);
          }
        } catch (err) {
          console.error('Core storage upload failed, falling back to Base64:', err);
          // If live upload fails, store in local DB as Base64 helper
          finalUrl = await fileToBase64(payload.file);
        }
      } else {
        // Mock image storage via relative ObjectURL or base64 file string for extreme mock fidelity
        finalUrl = await fileToBase64(payload.file);
      }
    }

    const newItem: GalleryItem = {
      id: generateUUID(),
      title: payload.title || 'Untitled Creation',
      description: payload.description || 'No description provided.',
      url: finalUrl,
      storage_path: storagePath,
      tags: payload.tags && payload.tags.length > 0 ? payload.tags : ['Design'],
      width: defaultWidth,
      height: defaultHeight,
      size_kb: defaultSize,
      created_at: new Date().toISOString(),
      likes: 0,
      views: 0,
      category: payload.category || 'General'
    };

    if (supabaseInstance && !currentConfig.useLocalFallback) {
      try {
        const { data, error } = await supabaseInstance
          .from('gallery_items')
          .insert([newItem])
          .select();

        if (error) throw error;
        if (data && data[0]) {
          const savedItem = data[0] as GalleryItem;
          // Emulate real-time by fetching again and broadcasting
          const allItems = await this.getItems();
          emitUpdate(allItems);
          return savedItem;
        }
      } catch (err) {
        console.warn('Supabase DB Insert failed. Simulating locally:', err);
      }
    }

    // Local DB simulation save
    const currentList = getLocalItems();
    const updatedList = [newItem, ...currentList];
    saveLocalItems(updatedList);
    return newItem;
  },

  // Delete an item
  async deleteItem(id: string): Promise<boolean> {
    if (supabaseInstance && !currentConfig.useLocalFallback) {
      try {
        // Step 1: Get storage path
        const { data: itemData } = await supabaseInstance
          .from('gallery_items')
          .select('storage_path')
          .eq('id', id)
          .single();

        if (itemData?.storage_path) {
          await supabaseInstance.storage
            .from('gallery')
            .remove([itemData.storage_path]);
        }

        // Step 2: Delete database record
        const { error } = await supabaseInstance
          .from('gallery_items')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        const allItems = await this.getItems();
        emitUpdate(allItems);
        return true;
      } catch (err) {
        console.warn('Supabase delete failed, operating locally:', err);
      }
    }

    // Local DB simulation delete
    const currentList = getLocalItems();
    const updatedList = currentList.filter(item => item.id !== id);
    saveLocalItems(updatedList);
    return true;
  },

  // Simulate or execute item liking (increases value by 1)
  async likeItem(id: string): Promise<number> {
    if (supabaseInstance && !currentConfig.useLocalFallback) {
      try {
        // Fetch current views and likes
        const { data: fetchItem } = await supabaseInstance
          .from('gallery_items')
          .select('likes')
          .eq('id', id)
          .single();

        const currentLikes = fetchItem?.likes || 0;
        const newLikes = currentLikes + 1;

        const { error } = await supabaseInstance
          .from('gallery_items')
          .update({ likes: newLikes })
          .eq('id', id);

        if (error) throw error;
        return newLikes;
      } catch (err) {
        console.warn('Supabase update like failed, simulating locally:', err);
      }
    }

    const currentList = getLocalItems();
    let resultingLikes = 1;
    const updatedList = currentList.map(item => {
      if (item.id === id) {
        resultingLikes = item.likes + 1;
        return { ...item, likes: resultingLikes };
      }
      return item;
    });
    saveLocalItems(updatedList);
    return resultingLikes;
  },

  // Record an item view (automatic on modal click)
  async viewItem(id: string): Promise<number> {
    if (supabaseInstance && !currentConfig.useLocalFallback) {
      try {
        const { data: fetchItem } = await supabaseInstance
          .from('gallery_items')
          .select('views')
          .eq('id', id)
          .single();

        const currentViews = fetchItem?.views || 0;
        const newViews = currentViews + 1;

        await supabaseInstance
          .from('gallery_items')
          .update({ views: newViews })
          .eq('id', id);

        return newViews;
      } catch (err) {
        console.debug('Supabase register view failed, simulating locally:', err);
      }
    }

    const currentList = getLocalItems();
    let resultingViews = 1;
    const updatedList = currentList.map(item => {
      if (item.id === id) {
        resultingViews = item.views + 1;
        return { ...item, views: resultingViews };
      }
      return item;
    });
    saveLocalItems(updatedList);
    return resultingViews;
  },

  // Stats calculation
  async getStats(): Promise<GalleryStats> {
    const items = await this.getItems();
    const categories: { [key: string]: number } = {};
    let totalLikes = 0;
    let totalViews = 0;
    let totalSizeKb = 0;

    items.forEach(item => {
      totalLikes += item.likes;
      totalViews += item.views;
      totalSizeKb += item.size_kb;
      
      const cat = item.category || 'General';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    return {
      totalCount: items.length,
      totalSizeKb,
      totalLikes,
      totalViews,
      categories
    };
  },

  // Real-time listener registration
  subscribeToChanges(callback: UpdateCallback): () => void {
    subscribers.add(callback);

    let supabaseChannelSubscription: any = null;

    if (supabaseInstance && !currentConfig.useLocalFallback) {
      // Set up real Supabase database subscription channel
      supabaseChannelSubscription = supabaseInstance
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gallery_items' },
          async (payload) => {
            console.log('Realtime change detected on Supabase:', payload);
            const freshItems = await this.getItems();
            emitUpdate(freshItems);
            callback(freshItems);
          }
        )
        .subscribe();
    }

    // Return the unsubscribe/teardown function
    return () => {
      subscribers.delete(callback);
      if (supabaseChannelSubscription) {
        supabaseInstance?.removeChannel(supabaseChannelSubscription);
      }
    };
  },

  // SQL schema code helper
  getPostgresSchemaCode(): string {
    return `-- CREATE GALLERY ITEMS TABLE
create table public.gallery_items (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  url text not null,
  storage_path text,
  tags text[] default '{}'::text[],
  width integer default 1200,
  height integer default 800,
  size_kb integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  likes integer default 0 not null,
  views integer default 0 not null,
  category text default 'General'::text not null
);

-- ENABLE ROW LEVEL SECURITY (RLS) FOR PRIVACY CONTROL
alter table public.gallery_items enable row level security;

-- CREATE POLICIES (All are public readable for the showcase, authenticated/anon users can add/delete for this applet)
create policy "Allow public read-only access to gallery"
  on public.gallery_items for select
  using (true);

create policy "Allow public inserts"
  on public.gallery_items for insert
  with check (true);

create policy "Allow update for likes and views"
  on public.gallery_items for update
  using (true);

create policy "Allow all deletions"
  on public.gallery_items for delete
  using (true);

-- STORAGE BUCKETS CONFIGURATION IN SUPABASE
-- 1. Create a public bucket in your Supabase storage tab named "gallery"
-- 2. Set storage public access to allowed
-- 3. Create public read/write storage policies for bucket "gallery"
`;
  }
};

// Helper utility for file string conversion
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Convert File helper to safe Uint8Array for browser AWS S3 client
async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// Extract project reference parsed from Supabase API URL
function getProjectRef(): string {
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://pkoribfxgybwzgbtgnke.supabase.co';
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (match && match[1]) {
    return match[1];
  }
  return 'pkoribfxgybwzgbtgnke';
}

// Generate a valid RFC4122 v4 UUID string
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
