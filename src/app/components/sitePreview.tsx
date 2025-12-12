"use client";

import { useEffect, useState } from "react";

export default function SitePreview({ url }: { url: string }) {
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await fetch(`/api/site-preview?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data.ok) setValidated(true);
      } catch (e) {
        console.error("Preview validation failed");
      }
    };
    validate();
  }, [url]);

  return (
    <div className="bg-zinc-900 rounded-md shadow-lg p-4 h-full overflow-hidden ">
      <h3 className="text-lg font-semibold text-blue-500 mb-2"></h3>

      {!validated && (
        <div className="text-gray-400 text-sm">
          Preparing website preview…
        </div>
      )}

      {validated && (
        <iframe
          src={url}
          className="w-full h-full rounded-md border border-zinc-800 overflow-hidden"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      )}
    </div>
  );
}
