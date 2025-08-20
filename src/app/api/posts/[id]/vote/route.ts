import { NextRequest, NextResponse } from "next/server";
import { toggleVote } from "@/server/repos/votes";
import { checkAndRecordLimit } from "@/server/rateLimit";

export async function POST(request: NextRequest) {
  const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "").split(",")[0] || "unknown";
  const cookies = request.headers.get("cookie") || "";
  const visitorId = parseCookie(cookies, "visitorId") || ip;

  const burst = checkAndRecordLimit(`vote:${visitorId}`, 10, 60_000);
  const sustained = checkAndRecordLimit(`vote-hour:${visitorId}`, 100, 60 * 60_000);
  if (!burst.allowed || !sustained.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  // Path: /api/posts/[id]/vote -> ['', 'api', 'posts', '[id]', 'vote']
  const id = decodeURIComponent(request.nextUrl.pathname.split("/")[3] ?? "");
  const result = await toggleVote(id, visitorId);
  return NextResponse.json(result);
}

function parseCookie(header: string, name: string) {
  const m = header.match(new RegExp(`${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}


