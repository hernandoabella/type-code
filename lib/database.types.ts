// lib/database.types.ts
// TypeScript types matching the Supabase schema
// Tip: regenerate with `npx supabase gen types typescript --project-id YOUR_ID > lib/database.types.ts`

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

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
          id:          string;
          username?:   string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          username?:   string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
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
          updated_at?:      string;
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
        Relationships: [
          {
            foreignKeyName: "player_stats_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
          id?:          string;
          user_id:      string;
          snippet_id:   string;
          wpm:          number;
          accuracy:     number;
          time_elapsed: number;
          combo?:       number;
          rank:         string;
          completed_at?: string;
        };
        Update: {
          wpm?:          number;
          accuracy?:     number;
          time_elapsed?: number;
          combo?:        number;
          rank?:         string;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      leaderboard: {
        Row: {
          id:              string | null;
          username:        string | null;
          avatar_url:      string | null;
          xp:              number | null;
          player_level:    number | null;
          total_completed: number | null;
          best_wpm:        number | null;
          max_combo:       number | null;
          streak:          number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};