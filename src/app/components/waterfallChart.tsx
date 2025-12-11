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
    <div className="p-6 bg-zinc-900 rounded-xl shadow-md border border-zinc-700 max-w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-lg text-white">Waterfall Chart</h4>
        <div className="text-sm text-zinc-400">{total ? `${total} ms` : "--"}</div>
      </div>

    
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

                {/* Tooltip on hover */}
                <div className="absolute -top-6 bg-zinc-800/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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

      
      {total ? (
        <div className="flex justify-between text-xs text-zinc-400 mt-2 px-1">
          <span>0ms</span>
          <span>{Math.round(total / 2)}ms</span>
          <span>{Math.round(total)}ms</span>
        </div>
      ) : null}
    </div>
  );
}
