// src/app/components/ScoreCard.tsx
"use client";

import { useEffect, useState } from "react";
import { connectEventSource } from "../../lib/websocket";

function computeScore(latencies: number[]) {
  if (!latencies.length) return 0;
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  // simple mapping: lower latency -> higher score
  const score = Math.max(0, Math.min(100, Math.round(100 - avg / 10)));
  return score;
}

export default function ScoreCard({ target }: { target: string }) {
  const [latencies, setLatencies] = useState<number[]>([]);

  useEffect(() => {
    if (!target) return;
    const conn = connectEventSource(target, (name, data) => {
      if (name === "latency") {
        const l = typeof data.latency === "number" ? data.latency : null;
        if (l != null) setLatencies((s) => [...s.slice(-49), l]);
      }
    });
    return () => conn.close();
  }, [target]);

  const score = computeScore(latencies);
  const last = latencies.length ? Math.round(latencies[latencies.length - 1]) : null;

  return (
    <div className="p-4 bg-zinc-900 rounded">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Score</h3>
          <p className="text-zinc-400 text-sm">Realtime performance score</p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold">{score}</div>
          <div className="text-sm text-zinc-400">{last ? `${last} ms` : "-- last"}</div>
        </div>
      </div>
    </div>
  );
}
