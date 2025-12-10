
export const VERCEL_REGIONS = ["iad1", "fra1", "syd1", "sin1", "hnd1", "gru1"] as const;
export type Region = typeof VERCEL_REGIONS[number];

export function simulateRegionLatency(baseLatency: number | null, region: Region) {
  // Adds plausible offsets per region relative to baseLatency
  const jitter = Math.round(Math.random() * 60 - 30); 
  const regionFactor: Record<Region, number> = {
    iad1: 0,
    fra1: 20,
    syd1: 200,
    sin1: 150,
    hnd1: 120,
    gru1: 250,
  };
  if (baseLatency == null) return null;
  const raw = baseLatency + regionFactor[region] + jitter;
  return Math.max(10, Math.round(raw));
}
