"use client";

import { useEffect, useState } from "react";
import { connectEventSource } from "../../lib/websocket";

type LogEntry = {
  t: string;
  type: string;
  data: any;
};

export default function LiveUpdates({ target }: { target: string }) {
  const [events, setEvents] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (!target) return;

    const conn = connectEventSource(target, (name, data) => {
      setEvents((s) => [
        ...s.slice(-200),
        { t: new Date().toLocaleTimeString(), type: name, data },
      ]);
    });

    return () => conn.close();
  }, [target]);

  const color = (type: string) => {
    if (type.includes("error")) return "text-red-400";
    if (type.includes("network")) return "text-blue-400";
    if (type.includes("waterfall")) return "text-green-400";
    if (type.includes("latency")) return "text-yellow-400";
    return "text-zinc-300";
  };

  return (
    <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-700 h-64 overflow-auto">
      <h4 className="font-semibold text-white mb-2">Live Events</h4>

      <div className="space-y-1 text-xs">
        {events.length ? (
          [...events].reverse().map((e, i) => (
            <div key={i} className={`${color(e.type)} break-all`}>
              [{e.t}] {e.type}: {JSON.stringify(e.data)}
            </div>
          ))
        ) : (
          <div className="text-zinc-500">Waiting for events...</div>
        )}
      </div>
    </div>
  );
}
