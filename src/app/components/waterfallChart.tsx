"use client";

import { useEffect, useState } from "react";
import { connectEventSource } from "../../lib/websocket";

type Phase = { name: string; ms: number };

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
    <div className="p-4 bg-zinc-900 rounded h-40">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">Waterfall</h4>
        <div className="text-sm text-zinc-400">{total ? `${total} ms` : "--"}</div>
      </div>

      <div className="w-full h-8 bg-zinc-800 rounded overflow-hidden">
        {phases.length ? (
          <div className="flex h-full">
            {phases.map((p, i) => {
              const width = total ? Math.max(2, (p.ms / total) * 100) : 0;
              return (
                <div key={i} style={{ width: `${width}%` }} className="flex items-center justify-center text-xs text-zinc-300">
                  <div className="px-1 truncate" title={`${p.name}: ${p.ms}ms`}>
                    {p.name}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-500">No waterfall data yet</div>
        )}
      </div>
    </div>
  );
}
