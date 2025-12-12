"use client";
import { useEffect, useState } from "react";

export default function FrameworkDetector({ targetUrl }: { targetUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!targetUrl) return;
    runScan(targetUrl);
  }, [targetUrl]);

  const runScan = async (url: string) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/framework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-black/40 rounded-xl border border-zinc-800">
      <h2 className="text-xl font-semibold mb-3">Better Framework</h2>

      {loading && <div className="text-blue-400 text-sm">Scanning...</div>}

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {result && (
        <div className="mt-4 bg-zinc-900 p-4 rounded border border-zinc-700">
          <div className="text-lg font-semibold mb-2">
            Framework: {result.framework}
          </div>

          <h5>We Recommend</h5>
          <div className="space-y-1 text-sm text-zinc-300">
            {result.advice.map((line: string, i: number) => (
              <div key={i}>• {line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
