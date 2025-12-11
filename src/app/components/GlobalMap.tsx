"use client";

import { useEffect, useState } from "react";
import { connectEventSource } from "../../lib/websocket";
import { MapContainer, TileLayer, Circle, Marker, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Region = {
  region: string;
  latency: number | null;
};

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const REGION_LABELS: Record<
  string,
  { name: string; continent: string; coords: [number, number] }
> = {
  iad1: { name: "US East", continent: "North America", coords: [38.9072, -77.0369] },
  fra1: { name: "Europe", continent: "Europe", coords: [50.1109, 8.6821] },
  sin1: { name: "Asia (Singapore)", continent: "Asia", coords: [1.3521, 103.8198] },
  syd1: { name: "Australia", continent: "Oceania", coords: [-33.8688, 151.2093] },
  hnd1: { name: "Asia (Tokyo)", continent: "Asia", coords: [35.6895, 139.6917] },
  gru1: { name: "South America", continent: "South America", coords: [-23.5505, -46.6333] },
};

function colorFor(lat: number | null) {
  if (lat == null) return "#6b7280"; // gray
  if (lat < 200) return "#16a34a"; // green
  if (lat < 500) return "#eab308"; // yellow
  return "#dc2626"; // red
}

function radiusFor(lat: number | null) {
  if (lat == null) return 150000;
  if (lat < 200) return 300000;
  if (lat < 500) return 450000;
  return 600000;
}

function getDomainName(url: string) {
  try {
    const validUrl = url.startsWith("http") ? url : `https://${url}`;
    const hostname = new URL(validUrl).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function GlobalMap({ target }: { target: string }) {
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    if (!target) return;
    const conn = connectEventSource(target, (name, data) => {
      if (name === "regions") {
        setRegions(data.regions ?? []);
      }
    });
    return () => conn.close();
  }, [target]);

  return (
    <div className="p-6 bg-zinc-900 rounded-lg max-w-8xl mx-auto select-none">
     
      <h4 className="text-white font-semibold text-lg mb-2">Global Performance of : {getDomainName(target)}</h4>
      <p className="text-zinc-400 text-sm mb-4">
        Shows how fast the website responds from different parts of the world.
      </p>

     
      <div className="rounded-lg overflow-hidden border border-zinc-700">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={2}
          maxZoom={8}
          style={{ width: "100%", height: "400px", backgroundColor: "black" }}
          zoomControl={false} 

        >
          <ZoomControl position="bottomright" />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />

          {regions.map((r) => {
            const info = REGION_LABELS[r.region] ?? {
              name: r.region,
              continent: "Unknown",
              coords: [0, 0],
            };

            return (
              <div key={r.region}>
                <Circle
                  center={info.coords}
                  radius={radiusFor(r.latency)}
                  pathOptions={{
                    color: colorFor(r.latency),
                    fillColor: colorFor(r.latency),
                    fillOpacity: 0.4,
                  }}
                />
                <Marker position={info.coords}>
                  <Popup>
                    <div className="font-bold">{info.name}</div>
                    <div>
                      {r.latency == null ? "No data" : `${Math.round(r.latency)} ms`}
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}
        </MapContainer>
      </div>

     
      <div className="flex gap-6 mt-4 text-white text-sm">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-green-600 rounded-full inline-block" />
          <span>Good (&lt;200ms)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-yellow-500 rounded-full inline-block" />
          <span>Medium (200-500ms)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-red-600 rounded-full inline-block" />
          <span>High (&gt;500ms)</span>
        </div>
      </div>
    </div>
  );
}
