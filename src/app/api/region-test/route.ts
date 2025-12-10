export const runtime = "edge";

import { fetchWithTimeoutAbsolute } from "@/lib/performance";
import { VERCEL_REGIONS } from "@/lib/regions";

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const target = urlObj.searchParams.get("url");
    const region = urlObj.searchParams.get("region");
    if (!target) return new Response(JSON.stringify({ error: "Missing url param" }), { status: 400 });


    const res = await fetchWithTimeoutAbsolute(target, 8000);

    return new Response(JSON.stringify({ region: region ?? null, result: res }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
