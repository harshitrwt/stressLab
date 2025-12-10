export async function readCache(url: string) {
  const res = await fetch(`/api/cache?url=${encodeURIComponent(url)}`);
  return res.json();
}

export async function writeCache(url: string, data: any) {
  await fetch(`/api/cache`, {
    method: "POST",
    body: JSON.stringify({ url, data }),
  });
}
