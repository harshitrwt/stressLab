import { NextResponse } from "next/server";
import { detectFrameworkFromHeaders, detectFrameworkFromHTML, getFrameworkAdvice } from "@/lib/framework";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "FrameworkDetectorBot/1.0" },
      cache: "no-store",
    });

    const html = await res.text();
    const framework = detectFrameworkFromHTML(html);
    const advice = getFrameworkAdvice(framework);

    return NextResponse.json({
      framework,
      advice,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Scan failed" },
      { status: 500 }
    );
  }
}
