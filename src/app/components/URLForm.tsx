"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateURL } from "@/lib/validate";

export default function URLForm() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const safe = validateURL(input);

    if (!safe.success) {
      setError("Enter a valid URL");
      return;
    }

    router.push(`/test/${encodeURIComponent(input)}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="https://example.com"
        className="w-full px-4 py-2 rounded bg-zinc-900 border border-zinc-700"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full py-2 rounded cursor-pointer bg-blue-500 hover:bg-blue-600 transition"
      >
        Start Test
      </button>
    </form>
  );
}
