import * as Runtime from "./detectRuntime";

export interface SimpleWebSocket {
  send(data: string): void;
  onmessage: ((event: MessageEvent) => void) | null;
  onopen: ((event: Event) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  close(code?: number, reason?: string): void;
}

/**
 * Creates a simplified websocket connection. This function works in both Node.js and browser.
 */
export async function createSimpleWebSocket(
  url: string
): Promise<SimpleWebSocket> {
  switch (Runtime.detectRuntime()) {
    case "vercel-edge":
    case "cloudflare-workers":
    case "browser": {
      return new WebSocket(url) as SimpleWebSocket;
    }

    case "node": {
      // Use ws library (for Node.js).
      // Note: we try both import and require to support both ESM and CJS.

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let WebSocket: any;

      try {
        WebSocket = (await import("ws")).default;
      } catch (error) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          WebSocket = require("ws");
        } catch (error) {
          throw new Error(`Failed to load 'ws' module dynamically.`);
        }
      }

      return new WebSocket(url) as SimpleWebSocket;
    }

    default: {
      throw new Error("Unknown runtime");
    }
  }
}
