
export type Phase = { name: string; ms: number };

export function makeWaterfall(latencyMs: number | null) : Phase[] {

  if (!latencyMs || latencyMs <= 0) return [];

  // Assign sensible proportional phases.
  // These are approximations — exact low-level timings (DNS/TCP/TLS) require lower-level sockets.
  // We keep them deterministic-ish for reproducibility.
  const dns = Math.max(1, Math.round(latencyMs * 0.05));
  const connect = Math.max(1, Math.round(latencyMs * 0.1));
  const tls = Math.max(0, Math.round(latencyMs * 0.05));
  const ttfb = Math.max(1, Math.round(latencyMs * 0.4));
  const download = Math.max(1, latencyMs - (dns + connect + tls + ttfb));

  const total = dns + connect + tls + ttfb + download;
  const diff = total - latencyMs;
  if (diff !== 0) {
    const adj = Math.max(0, download - diff);
    return [
      { name: "dns", ms: dns },
      { name: "connect", ms: connect },
      { name: "tls", ms: tls },
      { name: "ttfb", ms: ttfb },
      { name: "download", ms: adj },
    ];
  }

  return [
    { name: "dns", ms: dns },
    { name: "connect", ms: connect },
    { name: "tls", ms: tls },
    { name: "ttfb", ms: ttfb },
    { name: "download", ms: download },
  ];
}
