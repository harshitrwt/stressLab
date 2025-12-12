"use client";

import { useEffect, useState } from "react";
import { connectEventSource } from "../../lib/websocket";
import clsx from "clsx";

type Phase = { name: string; ms: number };

const PHASE_COLORS = [
  "#16a34a", // green
  "#eab308", // yellow
  "#dc2626", // red
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f97316", // orange
];

export default function WaterfallChart({ target }: { target: string }) {
  const [phases, setPhases] = useState<Phase[]>([]);

  useEffect(() => {
    if (!target) return;
    const conn = connectEventSource(target, (name, data) => {
      if (name === "waterfall") {
        setPhases(data.phases ?? []);
      }
    });
    return () => conn.close();
  }, [target]);

  const total = phases.reduce((s, p) => s + p.ms, 0) || 0;

  return (
    <div className="p-6 bg-zinc-900 rounded-xl shadow-md border border-zinc-700 max-w-full space-y-4">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-lg text-white">Waterfall Chart</h4>
        <div className="text-sm text-zinc-400">
          {total ? `Total Load Time: ${total} ms` : "--"}
        </div>
      </div>

      {/* Explanatory text */}
      <p className="text-sm text-zinc-400 leading-relaxed">
        This chart shows how your webpage loads step-by-step. Each colored bar represents a phase in
        the loading process (DNS lookup, connecting, waiting for the server, downloading content, rendering, etc.).
        Longer bars = slower stages.
      </p>

      {/* Chart */}
      <div className="relative w-full h-12 bg-zinc-800 rounded-lg overflow-hidden flex">
        {phases.length ? (
          phases.map((p, i) => {
            const width = total ? Math.max(2, (p.ms / total) * 100) : 0;
            const color = PHASE_COLORS[i % PHASE_COLORS.length];

            return (
              <div
                key={i}
                style={{ width: `${width}%`, backgroundColor: color }}
                className="relative flex items-center justify-center transition-all duration-500 group"
              >
                <span
                  className={clsx(
                    "text-xs font-medium text-white px-1 truncate",
                    width < 10 ? "opacity-0 group-hover:opacity-100 absolute left-1" : ""
                  )}
                  title={`${p.name}: ${p.ms} ms`}
                >
                  {p.name}
                </span>

                {/* Tooltip */}
                <div className="absolute -top-8 bg-black/90 backdrop-blur-md text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {p.name}: {p.ms} ms
                </div>
              </div>
            );
          })
        ) : (
          <div className="w-full flex items-center justify-center text-zinc-500 text-sm">
            No waterfall data yet
          </div>
        )}
      </div>

      {/* Time indicators */}
      {total ? (
        <div className="flex justify-between text-xs text-zinc-400 mt-1 px-1">
          <span>0 ms</span>
          <span>{Math.round(total / 2)} ms</span>
          <span>{Math.round(total)} ms</span>
        </div>
      ) : null}

      {/* Legend (explains color mapping) */}
      {phases.length ? (
        <div className="mt-4 bg-zinc-800 p-3 rounded-lg border border-zinc-700">
          <h5 className="text-sm font-semibold text-white mb-2">Phase Breakdown</h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {phases.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: PHASE_COLORS[i % PHASE_COLORS.length] }}
                ></div>
                <div className="text-xs text-zinc-300">
                  <span className="font-medium text-white">{p.name}</span> — {p.ms} ms
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Explanation Panel */}
      {phases.length ? (
        <div className="mt-2 bg-zinc-800 p-3 rounded-lg border border-zinc-700">
          <h5 className="text-sm font-semibold text-white mb-2">What this means</h5>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The browser loads your website in multiple steps. If any bar looks too long, it means
            that specific step is slowing the site:
          </p>

          <ul className="list-disc list-inside mt-2 text-xs text-zinc-400 space-y-1">
            <li><span className="text-white">DNS Lookup:</span> Time to find the server.</li>
            <li><span className="text-white">Connection:</span> Browser connects to the server.</li>
            <li><span className="text-white">TLS Handshake:</span> Secure connection setup.</li>
            <li><span className="text-white">Wait (TTFB):</span> Server preparing the response.</li>
            <li><span className="text-white">Download:</span> Transfer of page resources.</li>
            <li><span className="text-white">Render:</span> Browser assembling the page visually.</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
