import { NextResponse } from "next/server";
import { listBoardsWithStats } from "@/server/repos/boards";

export async function GET() {
  const data = await listBoardsWithStats();
  return NextResponse.json(data);
}


