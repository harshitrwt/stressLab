
export async function fetchWithTimeoutAbsolute(url: string, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const start = Date.now();

  try {
    const res = await fetch(url, { method: "GET", signal: controller.signal, redirect: "follow" });
    const latency = Date.now() - start;
    const len = res.headers.get("content-length");
    clearTimeout(id);
    return {
      ok: res.ok,
      status: res.status,
      latency,
      contentLength: len ? Number(len) : null,
    };
  } catch (err: any) {
    clearTimeout(id);
    return { ok: false, status: null, latency: null, contentLength: null, error: String(err) };
  }
}
