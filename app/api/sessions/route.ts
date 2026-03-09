// app/api/sessions/route.ts
// POST — save a completed snippet session + update player stats

import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // ── Auth check ──────────────────────────────────────────────
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ──────────────────────────────────────────────
  const body = await request.json();
  const { snippet_id, wpm, accuracy, time_elapsed, combo, rank } = body;

  if (!snippet_id || wpm == null || accuracy == null || !rank) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // ── Insert session ──────────────────────────────────────────
  const { error: sessionError } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      snippet_id,
      wpm,
      accuracy,
      time_elapsed,
      combo: combo ?? 0,
      rank,
    });

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  // ── Upsert player stats ─────────────────────────────────────
  // Fetch current stats first to compare
  const { data: current } = await supabase
    .from("player_stats")
    .select("*")
    .eq("user_id", user.id)
    .single() as { data: { xp: number; total_completed: number; max_combo: number; best_wpm: number } | null };

  const { error: statsError } = await supabase
    .from("player_stats")
    .upsert({
      user_id:         user.id,
      xp:              ((current as any)?.xp ?? 0) + body.xp_gained,
      player_level:    body.player_level,
      streak:          body.streak,
      total_completed: ((current as any)?.total_completed ?? 0) + 1,
      max_combo:       Math.max((current as any)?.max_combo ?? 0, combo ?? 0),
      best_wpm:        Math.max((current as any)?.best_wpm ?? 0, wpm),
      updated_at:      new Date().toISOString(),
    });

  if (statsError) {
    return NextResponse.json({ error: statsError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}