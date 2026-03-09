// app/api/leaderboard/route.ts
// GET — top 50 players by XP

import { createServerSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}