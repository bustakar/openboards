import { NextRequest, NextResponse } from "next/server";
import { getBoardBySlug } from "@/server/repos/boards";

export async function GET(request: NextRequest) {
  const slug = decodeURIComponent(request.nextUrl.pathname.split("/")[3] ?? "");
  const board = await getBoardBySlug(slug);
  if (!board) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(board);
}


