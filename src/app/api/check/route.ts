export const runtime = "edge";

import { fetchWithTimeoutAbsolute } from "@/lib/performance";

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const target = urlObj.searchParams.get("url");
    if (!target) return new Response(JSON.stringify({ error: "Missing url param" }), { status: 400 });
    
    const parsed = target;
    const result = await fetchWithTimeoutAbsolute(parsed, 8000);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
