"use client";

import { useEffect, useState } from "react";
import { connectEventSource } from "../../lib/websocket";
import { motion, AnimatePresence } from "framer-motion";

function computeScore(latencies: number[]) {
  if (!latencies.length) return 0;
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const score = Math.max(0, Math.min(100, Math.round(100 - avg / 10)));
  return score;
}

function scoreColor(score: number) {
  if (score >= 80) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-500";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 50) return "Moderate";
  return "Poor";
}

export default function ScoreCard({ target }: { target: string }) {
  const [latencies, setLatencies] = useState<number[]>([]);
  const [animatedScore, setAnimatedScore] = useState(0);

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
  const avg = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : null;

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedScore(score), 200);
    return () => clearTimeout(timeout);
  }, [score]);

  
  const message =
    score >= 80
      ? "Your website is performing excellently! Users should experience fast loading times."
      : score >= 50
      ? "Your website is performing moderately. Some users may notice delays."
      : "Your website performance is poor. Users may experience slow loading times.";

  return (
    <div className="p-6 bg-zinc-900 rounded-md mx-auto shadow-lg max">
     
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold">Performance Score</h3>
          <p className="text-zinc-400 text-sm">Realtime score based on website latency</p>
        </div>

        <div className="text-right">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={animatedScore}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`text-4xl font-bold ${scoreColor(animatedScore)}`}
            >
              {animatedScore}
            </motion.div>
          </AnimatePresence>
          <div className="text-sm text-zinc-400">
            {last ? `Last: ${last} ms` : "-- last"}
          </div>
          {avg && <div className="text-sm text-zinc-400">Avg: {avg} ms</div>}
        </div>
      </div>

      
      <div className="mt-3">
        <span className={`px-2 py-1 rounded ${scoreColor(score)} bg-zinc-800 font-semibold`}>
          {scoreLabel(score)}
        </span>
        <p className="text-zinc-400 text-sm mt-1">{message}</p>
      </div>

      
      <div className="mt-4 h-16 bg-zinc-800 rounded overflow-hidden relative">
        {latencies.length ? (
          <svg className="w-full h-full">
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              points={latencies
                .map((lat, i) => {
                  const svgWidth = 100; // percent-based
                  const svgHeight = 16; // div height
                  const x = (i / Math.max(latencies.length - 1, 1)) * svgWidth;
                  const maxLat = 1000;
                  const y = svgHeight - Math.min(lat, maxLat) / maxLat * svgHeight;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
            No latency data yet
          </div>
        )}
      </div>

      
    </div>
  );
}
