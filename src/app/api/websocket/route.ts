export const runtime = "edge";

import { fetchWithTimeoutAbsolute } from "@/lib/performance";
import { makeWaterfall } from "@/lib/waterfall";
import { VERCEL_REGIONS, simulateRegionLatency } from "@/lib/regions";
import { computeScoreFromLatencies } from "@/lib/score";

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}

function sseEvent(name: string | null, data: any) {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  const lines: string[] = [];
  if (name) lines.push(`event: ${name}`);
  for (const chunk of payload.split("\n")) lines.push(`data: ${chunk}`);
  return lines.join("\n") + "\n\n";
}


const isDeployed = typeof process !== "undefined" && !!(process.env && (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get("url");
  if (!target) {
    return new Response("Missing url param", { status: 400 });
  }

  const origin = url.origin;
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();


  await writer.write(new TextEncoder().encode(sseEvent("connected", { msg: "connected", target })));

  let stopped = false;

  
  (async () => {
    const recentLatencies: number[] = [];

    try {
      while (!stopped) {
        let checkResult = await (async () => {
          try {
            return await fetchWithTimeoutAbsolute(target, 8000);
          } catch (err) {
            return { ok: false, status: null, latency: null, error: String(err) };
          }
        })();

        
        const latency = checkResult.latency ?? null;
        const ok = checkResult.ok ?? false;

       
        await writer.write(new TextEncoder().encode(sseEvent("latency", { timestamp: Date.now(), latency, ok, status: checkResult.status })));

        const waterfall = makeWaterfall(latency);
        await writer.write(new TextEncoder().encode(sseEvent("waterfall", { timestamp: Date.now(), phases: waterfall })));

      
        const regionsPayload: { region: string; latency: number | null }[] = [];

        if (isDeployed) {
          for (const region of VERCEL_REGIONS) {
            try {
              const rRes = await fetch(`${origin}/api/region-test?url=${encodeURIComponent(target)}&region=${region}`, { method: "GET" });
              const json = await rRes.json();
              const latencyVal = json?.result?.latency ?? null;
              regionsPayload.push({ region, latency: latencyVal });
            } catch {
              regionsPayload.push({ region, latency: null });
            }
          }
        } else {
          
          const base = latency ?? Math.round(100 + Math.random() * 300);
          for (const region of VERCEL_REGIONS) {
            regionsPayload.push({ region, latency: simulateRegionLatency(base, region) });
          }
        }

        await writer.write(new TextEncoder().encode(sseEvent("regions", { timestamp: Date.now(), regions: regionsPayload })));

        
        const valid = regionsPayload.map((r) => (typeof r.latency === "number" ? r.latency : null)).filter((v) => v != null) as number[];
        if (valid.length) {
          recentLatencies.push(...valid);
        
          if (recentLatencies.length > 200) recentLatencies.splice(0, recentLatencies.length - 200);
        } else if (latency) {
          recentLatencies.push(latency);
          if (recentLatencies.length > 200) recentLatencies.splice(0, recentLatencies.length - 200);
        }

        const score = computeScoreFromLatencies(recentLatencies);
        await writer.write(new TextEncoder().encode(sseEvent("score", { timestamp: Date.now(), score })));

       
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch (err) {
      
    } finally {
      try {
        writer.close();
      } catch {}
    }
  })();

  return new Response(readable, { headers: sseHeaders() });
}
