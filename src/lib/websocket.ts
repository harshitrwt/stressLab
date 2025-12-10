// src/lib/websocket.ts
export type OnEvent = (eventName: string, data: any) => void;

export function connectEventSource(targetUrl: string, onEvent: OnEvent) {
  if (!targetUrl) throw new Error("targetUrl required for SSE connection");
  const url = `/api/events?url=${encodeURIComponent(targetUrl)}`;
  const es = new EventSource(url);

  es.onopen = () => {
    onEvent("open", { msg: "connected" });
  };

  es.onmessage = (e) => {
  
    try {
      onEvent("message", JSON.parse(e.data));
    } catch {
      onEvent("message", e.data);
    }
  };

  
  es.addEventListener("latency", (ev: MessageEvent) => {
    try {
      onEvent("latency", JSON.parse(ev.data));
    } catch {
      onEvent("latency", ev.data);
    }
  });

  es.addEventListener("waterfall", (ev: MessageEvent) => {
    try {
      onEvent("waterfall", JSON.parse(ev.data));
    } catch {
      onEvent("waterfall", ev.data);
    }
  });

  es.addEventListener("regions", (ev: MessageEvent) => {
    try {
      onEvent("regions", JSON.parse(ev.data));
    } catch {
      onEvent("regions", ev.data);
    }
  });

  es.addEventListener("connected", (ev: MessageEvent) => {
    try {
      onEvent("connected", JSON.parse(ev.data));
    } catch {
      onEvent("connected", ev.data);
    }
  });

  es.addEventListener("score", (ev: MessageEvent) => {
    try {
      onEvent("score", JSON.parse(ev.data));
    } catch {
      onEvent("score", ev.data);
    }
  });

  es.onerror = (err) => {
    onEvent("error", err);
   
  };

  return {
    close: () => es.close(),
    es,
  };
}
