// src/app/components/LiveUpdates.tsx
"use client";

import { useEffect, useState } from "react";
import { connectEventSource } from "../../lib/websocket";

export default function LiveUpdates({ target }: { target: string }) {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    if (!target) return;
    const conn = connectEventSource(target, (name, data) => {
      const line = `[${new Date().toLocaleTimeString()}] ${name}: ${JSON.stringify(data)}`;
      setEvents((s) => [...s.slice(-100), line]);
    });
    return () => conn.close();
  }, [target]);

  return (
    <div className="p-4 bg-zinc-900 rounded h-48 overflow-auto">
      <h4 className="font-semibold mb-2">Live Events</h4>
      <div className="text-xs text-zinc-300 space-y-1">
        {events.length ? events.slice().reverse().map((e, i) => <div key={i}>{e}</div>) : <div className="text-zinc-500">Waiting for events...</div>}
      </div>
    </div>
  );
}
