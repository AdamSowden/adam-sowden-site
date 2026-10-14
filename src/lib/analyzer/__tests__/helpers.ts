import type { Resolver } from "../url-guard";

/** Resolver that maps test hostnames to fixed addresses. Unknown hosts fail. */
export function fakeResolver(map: Record<string, string[]>): Resolver {
  return async (host) => {
    const v = map[host.toLowerCase()];
    if (!v) throw new Error(`ENOTFOUND ${host}`);
    return v;
  };
}

export type Route = { status?: number; headers?: Record<string, string>; body?: string | Uint8Array; stream?: boolean };

/** fetch stub keyed by exact URL. */
export function fakeFetch(routes: Record<string, Route>): typeof fetch {
  return (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const r = routes[url];
    if (!r) return new Response("not found", { status: 404, headers: { "content-type": "text/html" } });
    const headers = new Headers({ "content-type": "text/html; charset=utf-8", ...(r.headers || {}) });
    const body = r.body ?? "";
    if (r.stream && typeof body === "string") {
      const enc = new TextEncoder().encode(body);
      const chunk = 64 * 1024;
      let off = 0;
      const stream = new ReadableStream<Uint8Array>({
        pull(c) {
          if (off >= enc.length) return c.close();
          c.enqueue(enc.subarray(off, off + chunk));
          off += chunk;
        },
      });
      return new Response(stream, { status: r.status ?? 200, headers });
    }
    return new Response(body as BodyInit, { status: r.status ?? 200, headers });
  }) as typeof fetch;
}

export const PUBLIC = ["93.184.216.34"];
