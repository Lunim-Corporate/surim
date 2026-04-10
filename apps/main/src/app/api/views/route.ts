import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { isValidUidServer } from "@/utils/validators";

// Rate limiter config
const RATE_LIMIT_WINDOW = 60_000; // ms
const MAX_REQUESTS = 10;

// In-memory per-key timestamp arrays.
const rateMap = new Map<string, number[]>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  const arr = rateMap.get(key) || [];
  // prune timestamps outside the current window
  const pruned = arr.filter((ts) => ts > windowStart);
  pruned.push(now);

  rateMap.set(key, pruned);
  return pruned.length <= MAX_REQUESTS;
}

function getClientIp(request: NextRequest): string {
  // Prefer X-Forwarded-For if your platform sets it (Vercel, Netlify, etc.)
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xrip = request.headers.get("x-real-ip");
  if (xrip) return xrip;
  return "unknown";
}

// GET /api/views?uid=article-slug
export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");

  if (!isValidUidServer(uid)) {
    return NextResponse.json({ error: "Invalid uid" }, { status: 400 });
  }

  // Rate limit by IP
  const ip = getClientIp(request);
  if (!checkRateLimit(`get-${ip}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("blog_views")
      .select("view_count")
      .eq("article_uid", uid)
      .single();

    if (error?.code === "PGRST116") {
      return NextResponse.json({ view_count: 0 });
    }

    if (error) throw error;

    return NextResponse.json({ view_count: data?.view_count || 0 });
  } catch (error) {
    console.error(error);
    console.error("Error fetching views:", error);
    return NextResponse.json({ error: "Failed to fetch views" }, { status: 500 });
  }
}

// POST /api/views
export async function POST(request: NextRequest) {
  try {
    const { uid } = await request.json();

    if (!isValidUidServer(uid)) {
      return NextResponse.json({ error: "Invalid uid" }, { status: 400 });
    }

    // Rate limit by IP + UID
    const ip = getClientIp(request);
    if (!checkRateLimit(`post-${ip}-${uid}`)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const supabase = supabaseServer();

    // Atomic increment using database function
    const { error } = await supabase.rpc("increment_view_count", {
      article_uid_param: uid,
    });

    if (error) throw error;

    // Fetch updated count
    const { data } = await supabase
      .from("blog_views")
      .select("view_count")
      .eq("article_uid", uid)
      .single();

    return NextResponse.json({
      view_count: data?.view_count || 0,
      success: true,
    });
  } catch (error) {
    console.error(error);
    console.error("Error incrementing views:", error);
    return NextResponse.json({ error: "Failed to increment views" }, { status: 500 });
  }
}
