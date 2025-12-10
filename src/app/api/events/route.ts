export const runtime = "nodejs";

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get("url");

  if (!target) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const origin = url.origin;
  const { readable, writable } = new TransformStream<Uint8Array>();
  const writer = writable.getWriter();

  
  let stopped = false;

  
  (async () => {
    try {
      await writer.write(
        new TextEncoder().encode(
          sseEvent("connected", {
            msg: "Performance monitoring connected",
            target,
            timestamp: Date.now(),
          })
        )
      );
    } catch {
      stopped = true;
    }
  })();

  
  (async () => {
    const recentLatencies: number[] = [];

    try {
      while (!stopped) {
        try {
          
          const checkResult = await fetchWithTimeoutAbsolute(target, 8000).catch(
            (err) => ({
              ok: false,
              status: null,
              latency: null,
              error: String(err),
            })
          );

          const latency = checkResult.latency ?? null;
          const ok = checkResult.ok ?? false;
          const status = checkResult.status ?? null;

          
          await writer.write(
            new TextEncoder().encode(
              sseEvent("latency", {
                timestamp: Date.now(),
                latency,
                ok,
                status,
                target,
              })
            )
          );

       
          const waterfall = makeWaterfall(latency);
          await writer.write(
            new TextEncoder().encode(
              sseEvent("waterfall", {
                timestamp: Date.now(),
                phases: waterfall,
                total: waterfall.reduce((s, p) => s + p.ms, 0),
              })
            )
          );

          
          const regionsPayload: { region: string; latency: number | null }[] =
            [];
          const base = latency ?? Math.round(100 + Math.random() * 300);

          for (const region of VERCEL_REGIONS) {
            const regionLatency = simulateRegionLatency(base, region);
            regionsPayload.push({ region, latency: regionLatency });
          }

          await writer.write(
            new TextEncoder().encode(
              sseEvent("regions", {
                timestamp: Date.now(),
                regions: regionsPayload,
              })
            )
          );

          
          const validRegionalLatencies = regionsPayload
            .map((r) => r.latency)
            .filter((v) => v != null) as number[];

          if (validRegionalLatencies.length > 0) {
            recentLatencies.push(...validRegionalLatencies);
            if (recentLatencies.length > 200) {
              recentLatencies.splice(0, recentLatencies.length - 200);
            }
          } else if (latency != null) {
            recentLatencies.push(latency);
            if (recentLatencies.length > 200) {
              recentLatencies.splice(0, recentLatencies.length - 200);
            }
          }

          const score = computeScoreFromLatencies(recentLatencies);

          await writer.write(
            new TextEncoder().encode(
              sseEvent("score", {
                timestamp: Date.now(),
                score,
                samples: recentLatencies.length,
              })
            )
          );

        
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } catch (cycleErr) {
         
          console.error("Event cycle error:", cycleErr);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    } catch (err) {
      
      console.error("SSE stream error:", err);
    } finally {
      try {
        writer.close();
      } catch {
      
      }
    }
  })();

  return new Response(readable, { headers: sseHeaders() });
}
