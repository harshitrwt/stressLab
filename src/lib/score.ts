
export function computeScoreFromLatencies(latencies: number[]) {
  if (!latencies.length) return 0;
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const p95 = latencies.slice().sort((a,b)=>a-b)[Math.max(0, Math.floor(latencies.length * 0.95) - 1)] ?? avg;
  const score = Math.round(Math.max(0, Math.min(100, 100 - (p95 / 10) - (avg / 200))));
  return score;
}
