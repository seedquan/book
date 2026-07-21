interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    // The catalogue is public and read-only. Permit only the local Brain app
    // runtime to embed it; X-Frame-Options cannot express this allowlist.
    headers.delete("X-Frame-Options");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors http://127.0.0.1:* http://localhost:*; form-action 'none'",
    );
    if (headers.get("content-type")?.includes("text/html")) {
      headers.set("Cache-Control", "no-cache, must-revalidate");
    }
    return new Response(response.body, { status: response.status, headers });
  },
} satisfies ExportedHandler<Env>;
