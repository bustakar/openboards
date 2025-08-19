import { NextRequest, NextResponse } from "next/server";
import { getBoardBySlug } from "@/server/repos/boards";
import { listPosts, createPost, type PostSort, type PostStatus } from "@/server/repos/posts";
import { checkAndRecordLimit } from "@/server/rateLimit";
import { createPostSchema, sanitizeBody, sanitizeTitle } from "@/server/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as PostStatus | null;
  const sort = (searchParams.get("sort") as PostSort | null) ?? "trending";
  const query = searchParams.get("query") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");

  const slug = decodeURIComponent(request.nextUrl.pathname.split("/")[3] ?? "");
  const board = await getBoardBySlug(slug);
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await listPosts({ boardId: board.id, status: status ?? undefined, sort, query, page, limit });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "").split(",")[0] || "unknown";
  const cookies = request.headers.get("cookie") || "";
  const visitorId = parseCookie(cookies, "visitorId") || ip;

  const burst = checkAndRecordLimit(`create:${visitorId}`, 1, 60_000);
  const sustained = checkAndRecordLimit(`create-hour:${visitorId}`, 10, 60 * 60_000);
  if (!burst.allowed || !sustained.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const slug = decodeURIComponent(request.nextUrl.pathname.split("/")[3] ?? "");
  const board = await getBoardBySlug(slug);
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const input = await request.json().catch(() => ({}));
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (parsed.data._hpt) return NextResponse.json({ ok: true }, { status: 204 });

  const title = sanitizeTitle(parsed.data.title);
  const body = parsed.data.body ? sanitizeBody(parsed.data.body) : null;
  const created = await createPost({ boardId: board.id, title, body });
  return NextResponse.json(created, { status: 201 });
}

function parseCookie(header: string, name: string) {
  const m = header.match(new RegExp(`${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}


