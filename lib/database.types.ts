// lib/database.types.ts
// TypeScript types matching the Supabase schema
// Tip: regenerate with `npx supabase gen types typescript --project-id YOUR_ID > lib/database.types.ts`

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:         string;
          username:   string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id:         string;
          username?:  string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          username?:   string | null;
          avatar_url?: string | null;
        };
      };
      player_stats: {
        Row: {
          user_id:         string;
          xp:              number;
          player_level:    number;
          streak:          number;
          total_completed: number;
          max_combo:       number;
          best_wpm:        number;
          updated_at:      string;
        };
        Insert: {
          user_id:          string;
          xp?:              number;
          player_level?:    number;
          streak?:          number;
          total_completed?: number;
          max_combo?:       number;
          best_wpm?:        number;
        };
        Update: {
          xp?:              number;
          player_level?:    number;
          streak?:          number;
          total_completed?: number;
          max_combo?:       number;
          best_wpm?:        number;
          updated_at?:      string;
        };
      };
      sessions: {
        Row: {
          id:           string;
          user_id:      string;
          snippet_id:   string;
          wpm:          number;
          accuracy:     number;
          time_elapsed: number;
          combo:        number;
          rank:         string;
          completed_at: string;
        };
        Insert: {
          user_id:      string;
          snippet_id:   string;
          wpm:          number;
          accuracy:     number;
          time_elapsed: number;
          combo?:       number;
          rank:         string;
        };
      };
    };
    Views: {
      leaderboard: {
        Row: {
          id:              string;
          username:        string | null;
          avatar_url:      string | null;
          xp:              number;
          player_level:    number;
          total_completed: number;
          best_wpm:        number;
          max_combo:       number;
          streak:          number;
        };
      };
    };
  };
};