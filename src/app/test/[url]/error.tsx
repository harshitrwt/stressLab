"use client";

export default function Error({ error }: { error: Error }) {
  return (
    <div className="p-6">
      <h2 className="text-red-500 text-xl font-semibold">Error loading test</h2>
      <p className="text-zinc-400 mt-2">{error.message}</p>
    </div>
  );
}
