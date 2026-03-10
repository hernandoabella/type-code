"use client";

// hooks/usePlayer.ts — v2
// Manages player auth + stats, syncing with Supabase
// New: lang, errors, keystrokes fields + accent color persistence

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface PlayerState {
  user:            User | null;
  username:        string | null;
  avatarUrl:       string | null;
  xp:              number;
  playerLevel:     number;
  streak:          number;
  totalCompleted:  number;
  maxCombo:        number;
  bestWpm:         number;
  avgWpm:          number;
  avgAccuracy:     number;
  isLoading:       boolean;
}

export interface SaveSessionPayload {
  snippet_id:   string;
  wpm:          number;
  accuracy:     number;
  time_elapsed: number;
  combo:        number;
  rank:         string;
  xp_gained:    number;
  player_level: number;
  streak:       number;
  // v2 additions
  lang?:        string;
  errors?:      number;
  keystrokes?:  number;
}

export function usePlayer() {
  const supabase = createClient();

  const [state, setState] = useState<PlayerState>({
    user:           null,
    username:       null,
    avatarUrl:      null,
    xp:             0,
    playerLevel:    1,
    streak:         0,
    totalCompleted: 0,
    maxCombo:       0,
    bestWpm:        0,
    avgWpm:         0,
    avgAccuracy:    0,
    isLoading:      true,
  });

  // ── Load user + stats ──────────────────────────────────────────
  const loadStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setState(s => ({
        ...s,
        user:           null,
        username:       null,
        avatarUrl:      null,
        isLoading:      false,
        xp:             +(localStorage.getItem("ns_xp")     ?? 0),
        playerLevel:    +(localStorage.getItem("ns_plvl")   ?? 1),
        streak:         +(localStorage.getItem("ns_streak") ?? 0),
        totalCompleted: +(localStorage.getItem("ns_total")  ?? 0),
      }));
      return;
    }

    const [{ data: profileData }, { data: statsData }] = await Promise.all([
      supabase.from("profiles").select("username, avatar_url").eq("id", user.id).single(),
      supabase.from("player_stats").select("*").eq("user_id", user.id).single(),
    ]);

    const profile = profileData as { username: string | null; avatar_url: string | null } | null;
    const stats   = statsData   as {
      xp: number; player_level: number; streak: number; total_completed: number;
      max_combo: number; best_wpm: number; avg_wpm: number; avg_accuracy: number;
    } | null;

    setState({
      user,
      username:       profile?.username   ?? (user.user_metadata?.user_name  as string) ?? null,
      avatarUrl:      profile?.avatar_url ?? (user.user_metadata?.avatar_url as string) ?? null,
      xp:             stats?.xp              ?? 0,
      playerLevel:    stats?.player_level    ?? 1,
      streak:         stats?.streak          ?? 0,
      totalCompleted: stats?.total_completed ?? 0,
      maxCombo:       stats?.max_combo       ?? 0,
      bestWpm:        stats?.best_wpm        ?? 0,
      avgWpm:         stats?.avg_wpm         ?? 0,
      avgAccuracy:    stats?.avg_accuracy    ?? 0,
      isLoading:      false,
    });
  }, []);

  useEffect(() => {
    loadStats();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        loadStats();
      }
    });
    return () => subscription.unsubscribe();
  }, [loadStats]);

  // ── Auth ────────────────────────────────────────────────────────
  const loginWithGitHub = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options:  { redirectTo: `${window.location.origin}/api/auth` },
    });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState(s => ({ ...s, user: null, username: null, avatarUrl: null }));
  }, []);

  // ── Save session ────────────────────────────────────────────────
  const saveSession = useCallback(async (payload: SaveSessionPayload) => {
    if (!state.user) {
      // Not logged in — persist in localStorage
      localStorage.setItem("ns_xp",     (state.xp + payload.xp_gained).toString());
      localStorage.setItem("ns_plvl",   payload.player_level.toString());
      localStorage.setItem("ns_streak", payload.streak.toString());
      localStorage.setItem("ns_total",  (state.totalCompleted + 1).toString());
      return;
    }

    // Optimistic update
    setState(s => ({
      ...s,
      xp:             s.xp + payload.xp_gained,
      playerLevel:    payload.player_level,
      streak:         payload.streak,
      totalCompleted: s.totalCompleted + 1,
      maxCombo:       Math.max(s.maxCombo, payload.combo),
      bestWpm:        Math.max(s.bestWpm,  payload.wpm),
    }));

    // Fire and forget
    fetch("/api/sessions", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) console.error("[saveSession] API error:", await res.text());
    }).catch(console.error);
  }, [state.user, state.xp, state.totalCompleted]);

  return { ...state, loginWithGitHub, logout, saveSession, reload: loadStats };
}