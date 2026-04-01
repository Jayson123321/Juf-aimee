import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  return NextResponse.json(
    {
      ok: false,
      message: "AI opdrachtgeneratie endpoint is nog niet gekoppeld.",
      received: body,
    },
    { status: 501 }
  );
}
