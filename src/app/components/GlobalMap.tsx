
"use client";

/**
 * This component shows a list of regions (for example: US-East, EU-West, Asia)
 * and displays how fast each region responds (its "latency").
 *
 * The server sends updates automatically using an EventSource connection,
 * so the data on the screen updates in real time without refreshing the page.
 */

import { useEffect, useState } from "react";
import { connectEventSource } from "../../lib/websocket";

type Region = { 
  region: string;        
  latency: number | null 
};

export default function GlobalMap({ target }: { target: string }) {
  // "regions" will hold all the region results coming from the server.
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    // If there is no EventSource target, do nothing.
    if (!target) return;

    const conn = connectEventSource(target, (eventName, data) => {
      if (eventName === "regions") {
        // The server sends "regions" as an array, so we store it.
        setRegions(data.regions ?? []);
      }
    });

    // When this component is removed, we close the connection.
    return () => conn.close();
  }, [target]);

  /**
   * Choose a color based on how fast the region responds.
   * - Green = fast
   * - Yellow = average
   * - Red = slow
   * - Grey = no data
   */
  const colorFor = (latency: number | null) => {
    if (latency == null) return "bg-zinc-700";   // No data
    if (latency < 100) return "bg-green-600";    // Very fast
    if (latency < 250) return "bg-yellow-600";   // Medium speed
    return "bg-red-600";                         // Slow
  };

  return (
    <div className="p-4 bg-zinc-900 rounded h-48">
      <h4 className="font-semibold mb-3">Regions</h4>

      <div className="grid grid-cols-3 gap-2">
        {regions.length ? (
          regions.map((regionItem) => (
            <div
              key={regionItem.region}
              className="flex items-center gap-3 bg-zinc-800 p-2 rounded"
            >
              
              <div
                className={`w-3 h-3 rounded-full ${colorFor(regionItem.latency)}`}
              />

             
              <div>
                <div className="text-sm">{regionItem.region}</div>
                <div className="text-xs text-zinc-400">
                  {regionItem.latency == null
                    ? "N/A" 
                    : `${Math.round(regionItem.latency)} ms`}
                </div>
              </div>
            </div>
          ))
        ) : (
          
          <div className="text-zinc-500 col-span-3">
            No region data yet
          </div>
        )}
      </div>
    </div>
  );
}
