"use client";

// hooks/usePlayer.ts
// Manages player auth + stats, syncing with Supabase
// Drop-in replacement for the localStorage logic in NeuralSyncMaster

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
    isLoading:      true,
  });

  // ── Load user + stats on mount ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Not logged in — fall back to localStorage
        setState(s => ({
          ...s,
          isLoading:      false,
          xp:             +(localStorage.getItem("ns_xp")    ?? 0),
          playerLevel:    +(localStorage.getItem("ns_plvl")  ?? 1),
          streak:         +(localStorage.getItem("ns_streak") ?? 0),
          totalCompleted: +(localStorage.getItem("ns_total")  ?? 0),
        }));
        return;
      }

      // Fetch profile + stats
      const [{ data: profile }, { data: stats }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("player_stats").select("*").eq("user_id", user.id).single(),
      ]);

      setState({
        user,
        username:       profile?.username ?? null,
        avatarUrl:      profile?.avatar_url ?? null,
        xp:             stats?.xp             ?? 0,
        playerLevel:    stats?.player_level   ?? 1,
        streak:         stats?.streak         ?? 0,
        totalCompleted: stats?.total_completed ?? 0,
        maxCombo:       stats?.max_combo       ?? 0,
        bestWpm:        stats?.best_wpm        ?? 0,
        isLoading:      false,
      });
    };

    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => init());
    return () => subscription.unsubscribe();
  }, []);

  // ── Login with GitHub ────────────────────────────────────────
  const loginWithGitHub = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options:  { redirectTo: `${window.location.origin}/api/auth` },
    });
  }, []);

  // ── Logout ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState(s => ({ ...s, user: null, username: null, avatarUrl: null }));
  }, []);

  // ── Save session after completing a snippet ──────────────────
  const saveSession = useCallback(async (payload: SaveSessionPayload) => {
    if (!state.user) {
      // Not logged in — just update localStorage
      localStorage.setItem("ns_xp",     (state.xp + payload.xp_gained).toString());
      localStorage.setItem("ns_plvl",   payload.player_level.toString());
      localStorage.setItem("ns_streak", payload.streak.toString());
      localStorage.setItem("ns_total",  (state.totalCompleted + 1).toString());
      return;
    }

    // Fire and forget — don't block the UI
    fetch("/api/sessions", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    }).catch(console.error);

    // Optimistically update local state
    setState(s => ({
      ...s,
      xp:             s.xp + payload.xp_gained,
      playerLevel:    payload.player_level,
      streak:         payload.streak,
      totalCompleted: s.totalCompleted + 1,
      maxCombo:       Math.max(s.maxCombo, payload.combo),
      bestWpm:        Math.max(s.bestWpm, payload.wpm),
    }));
  }, [state.user, state.xp, state.totalCompleted]);

  return { ...state, loginWithGitHub, logout, saveSession };
}