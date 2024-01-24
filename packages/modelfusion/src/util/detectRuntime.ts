export function detectRuntime() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalThisAny = globalThis as any;

  if (globalThisAny.EdgeRuntime) {
    return "vercel-edge";
  }

  if (globalThis.navigator?.userAgent === "Cloudflare-Workers") {
    return "cloudflare-workers";
  }

  if (globalThis.process?.release?.name === "node") {
    return "node";
  }

  if (globalThis.window) {
    return "browser";
  }

  return null;
}
