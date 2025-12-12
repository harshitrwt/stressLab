import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ ok: false, error: "Missing URL" });
  }

  try {
    new URL(url); // basic validation
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid URL" });
  }

  return NextResponse.json({ ok: true });
}
