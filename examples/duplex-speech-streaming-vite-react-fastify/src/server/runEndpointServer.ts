import cors from "@fastify/cors";
import Fastify from "fastify";
import { withRun } from "modelfusion";
import { Endpoint } from "./Endpoint";
import { EndpointRun } from "./EndpointRun";

export async function runEndpointServer<INPUT, EVENT>({
  endpoint,
  host = "0.0.0.0",
  port = 3001,
}: {
  endpoint: Endpoint<INPUT, EVENT>;
  host?: string;
  port?: number;
}) {
  const server = Fastify();

  await server.register(cors, {});

  const runs: Record<string, EndpointRun<EVENT>> = {};

  server.post(`/${endpoint.name}`, async (request) => {
    const input = endpoint.inputSchema.parse(request.body);

    const run = new EndpointRun<EVENT>({ endpointName: endpoint.name });

    runs[run.runId] = run;

    // start longer-running process (no await):
    withRun(run, async () => {
      endpoint
        .processRequest({ input, run })
        .catch((err) => {
          console.error(err);
        })
        .finally(async () => {
          run.finish();
        });
    });

    return {
      id: run.runId,
      path: `/${endpoint.name}/${run.runId}/events`,
    };
  });

  server.get(`/${endpoint.name}/:id/events`, async (request, reply) => {
    const runId = (request.params as any).id;

    const eventQueue = runs[runId]?.eventQueue;

    if (!eventQueue) {
      return {
        error: `No event queue found for run ID ${runId}`,
      };
    }

    const headers = {
      "Access-Control-Allow-Origin": "*",

      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Content-Encoding": "none",
    };

    reply.raw.writeHead(200, headers);

    const textEncoder = new TextEncoder();
    for await (const event of eventQueue) {
      if (reply.raw.destroyed) {
        console.log("client disconnected");
        break;
      }

      const text = textEncoder.encode(`data: ${JSON.stringify(event)}\n\n`);

      reply.raw.write(text);
    }

    reply.raw.end();
  });

  try {
    console.log(`Starting server on port ${port}...`);
    await server.listen({ port, host });
    console.log("Server started");
  } catch (err) {
    server.log.error("Failed to start server");
    server.log.error(err);
    process.exit(1);
  }
}
