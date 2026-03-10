// app/api/sessions/route.ts
// POST — save session + update all stats atomically

import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    snippet_id, wpm, accuracy, time_elapsed,
    combo, rank, xp_gained, player_level, streak,
    lang, errors, keystrokes,
  } = body;

  if (!snippet_id || wpm == null || accuracy == null || !rank) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // ── 1. Insert session row ───────────────────────────────────
  const { error: sessionError } = await supabase.from("sessions").insert({
    user_id:      user.id,
    snippet_id,
    wpm,
    accuracy,
    time_elapsed,
    combo:     combo     ?? 0,
    rank,
    xp_gained: xp_gained ?? 0,
    lang:      lang      ?? "javascript",
    errors:    errors    ?? 0,
  });

  if (sessionError) {
    console.error("[sessions] insert:", sessionError.message);
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  // ── 2. Fetch current player stats ───────────────────────────
  const { data: cur } = await supabase
    .from("player_stats").select("*").eq("user_id", user.id).single() as { data: { total_completed?: number; avg_wpm?: number; avg_accuracy?: number; xp?: number; player_level?: number; streak?: number; max_combo?: number; best_wpm?: number; total_errors?: number; total_keystrokes?: number } | null };

  const prevTotal  = cur?.total_completed ?? 0;
  const newTotal   = prevTotal + 1;
  const newAvgWpm  = Math.round(((cur?.avg_wpm  ?? 0) * prevTotal + wpm)      / newTotal);
  const newAvgAcc  = Math.round(((cur?.avg_accuracy ?? 0) * prevTotal + accuracy) / newTotal);

  // ── 3. Upsert player_stats ──────────────────────────────────
  const { error: statsError } = await supabase.from("player_stats").upsert({
    user_id:          user.id,
    xp:               (cur?.xp               ?? 0) + (xp_gained   ?? 0),
    player_level:     player_level ?? cur?.player_level ?? 1,
    streak:           streak       ?? cur?.streak       ?? 0,
    total_completed:  newTotal,
    max_combo:        Math.max(cur?.max_combo ?? 0, combo    ?? 0),
    best_wpm:         Math.max(cur?.best_wpm  ?? 0, wpm),
    total_errors:     (cur?.total_errors      ?? 0) + (errors     ?? 0),
    total_keystrokes: (cur?.total_keystrokes  ?? 0) + (keystrokes ?? 0),
    avg_wpm:          newAvgWpm,
    avg_accuracy:     newAvgAcc,
    updated_at:       new Date().toISOString(),
  });

  if (statsError) {
    console.error("[sessions] stats upsert:", statsError.message);
    return NextResponse.json({ error: statsError.message }, { status: 500 });
  }

  // ── 4. Daily + Lang stats via RPC ───────────────────────────
  await Promise.allSettled([
    supabase.rpc("upsert_daily_stats", {
      p_user_id: user.id, p_xp_earned: xp_gained ?? 0,
      p_wpm: wpm, p_accuracy: accuracy, p_combo: combo ?? 0,
    } as any),
    lang && supabase.rpc("upsert_lang_stats", {
      p_user_id: user.id, p_lang: lang, p_wpm: wpm, p_accuracy: accuracy,
    } as any),
  ]);

  return NextResponse.json({ success: true });
}