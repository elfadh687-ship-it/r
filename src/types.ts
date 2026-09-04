export interface Shortlink {
  id: number;
  user_id: string;
  title: string;
  short_slug: string;
  place_id: string | null;
  target_url: string | null;
  click_count: number;
  created_at: string;
  updated_at: string;
  click_logs?: { timestamp: string }[];
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AnalyticsData {
  totalShortlinks: number;
  totalClicks: number;
  unassignedCount: number;
  topLocations: {
    id: number;
    title: string;
    short_slug: string;
    click_count: number;
    place_id: string | null;
  }[];
  clickTrends: {
    date: string;
    label: string;
    clicks: number;
  }[];
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  mode: 'supabase' | 'local';
  url?: string;
  message: string;
}
