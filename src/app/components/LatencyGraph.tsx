// src/app/components/LatencyGraph.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { connectEventSource } from "../../lib/websocket";

export default function LatencyGraph({ target }: { target: string }) {
  const [points, setPoints] = useState<number[]>([]);

  useEffect(() => {
    if (!target) return;
    const conn = connectEventSource(target, (name, data) => {
      if (name === "latency") {
        const latency = typeof data.latency === "number" ? data.latency : null;
        setPoints((p) => [...p.slice(-40), latency ?? 0]); // keep 40 pts for more detail
      }
    });
    return () => conn.close();
  }, [target]);

  const width = 600;
  const height = 100;
  const padding = 12;

  const max = Math.max(100, ...points);
  const min = Math.min(0, ...points);

  // Generate path with smoothing (Cubic Bézier)
  const path = useMemo(() => {
    if (points.length < 2) return "";

    const step = (width - padding * 2) / (points.length - 1);

    const coords = points.map((v, i) => {
      const x = padding + i * step;
      const y =
        padding + (1 - (v - min) / (max - min || 1)) * (height - padding * 2);

      return { x, y };
    });

    let d = `M ${coords[0].x} ${coords[0].y}`;

    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];

      const midX = (prev.x + curr.x) / 2;
      d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return d;
  }, [points, width, height, padding, max, min]);

  // Generate vertical grid lines
  const verticalLines = useMemo(() => {
    const lines = [];
    const count = 6;
    for (let i = 0; i <= count; i++) {
      const x = padding + ((width - padding * 2) / count) * i;
      lines.push(<line key={i} x1={x} y1={padding} x2={x} y2={height - padding} stroke="#1f1f1f" strokeWidth="1" />);
    }
    return lines;
  }, []);

  // Generate horizontal grid lines
  const horizontalLines = useMemo(() => {
    const lines = [];
    const count = 4;
    for (let i = 0; i <= count; i++) {
      const y = padding + ((height - padding * 2) / count) * i;
      lines.push(<line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1f1f1f" strokeWidth="1" />);
    }
    return lines;
  }, []);

  return (
    <div className="p-4 bg-zinc-900 rounded h-full">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">Latency (ms)</h4>
        <div className="text-sm text-zinc-400 h-full">
          {points.length ? `${Math.round(points.at(-1) ?? 0)} ms` : "--"}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <rect x="0" y="0" width={width} height="100%" rx="8" fill="#111214" />

        
        {verticalLines}
        {horizontalLines}

       
        {path && <path d={path} stroke="#60A5FA" strokeWidth={2} fill="none" strokeLinecap="round" />}

  
        <text x={width - 4} y={padding + 10} fill="#777" fontSize="10" textAnchor="end">
          {Math.round(max)} ms
        </text>
        <text x={width - 4} y={height - padding - 4} fill="#777" fontSize="10" textAnchor="end">
          {Math.round(min)} ms
        </text>
      </svg>
    </div>
  );
}
