import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { withRun } from "../../core/getRun.js";
import type { AssetStorage } from "./AssetStorage.js";
import { Flow } from "./Flow.js";
import { FlowRun } from "./FlowRun.js";
import { Logger } from "./Logger.js";
import { PathProvider } from "./PathProvider.js";

export interface ModelFusionFlowPluginOptions {
  flow: Flow<any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  baseUrl: string;
  basePath: string;
  assetStorage: AssetStorage;
  logger: Logger;
}

export const modelFusionFlowPlugin: FastifyPluginAsync<
  ModelFusionFlowPluginOptions
> = async (
  fastify: FastifyInstance,
  {
    flow,
    baseUrl,
    basePath,
    assetStorage,
    logger,
  }: ModelFusionFlowPluginOptions
) => {
  type EVENT = z.infer<typeof flow.schema.events>;

  const paths = new PathProvider({
    baseUrl,
    basePath,
  });

  const runs: Record<string, FlowRun<EVENT>> = {};

  fastify.post(paths.basePath, async (request) => {
    const run = new FlowRun<EVENT>({
      paths,
      assetStorage,
      logger,
    });

    runs[run.runId] = run;

    // body the request body is json, parse and validate it:
    const input = flow.schema.input.parse(request.body);

    // start longer-running process (no await):
    withRun(run, async () => {
      flow
        .process({
          input,
          run,
        })
        .catch((error) => {
          logger.logError({
            run,
            message: "Failed to process flow",
            error,
          });
        })
        .finally(async () => {
          run.finish();
        });
    });

    return {
      id: run.runId,
      url: paths.getEventsUrl(run.runId),
    };
  });

  fastify.get(paths.getAssetPathTemplate(), async (request, reply) => {
    const runId = (request.params as any).runId; // eslint-disable-line @typescript-eslint/no-explicit-any
    const assetName = (request.params as any).assetName; // eslint-disable-line @typescript-eslint/no-explicit-any

    const asset = await assetStorage.readAsset({
      run: runs[runId],
      assetName,
    });

    if (asset == null) {
      logger.logError({
        run: runs[runId],
        message: `Asset ${assetName} not found`,
        error: new Error(`Asset ${assetName} not found`),
      });
      reply.status(404);
      return { error: `Asset ${assetName} not found` };
    }

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Length": asset.data.length,
      "Content-Type": asset.contentType,
      "Cache-Control": "no-cache",
    };

    reply.raw.writeHead(200, headers);

    reply.raw.write(asset.data);
    reply.raw.end();

    return;
  });

  fastify.get(paths.getEventsPathTemplate(), async (request, reply) => {
    const runId = (request.params as any).runId; // eslint-disable-line @typescript-eslint/no-explicit-any

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
        break; // client disconnected
      }

      reply.raw.write(textEncoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    }

    if (!reply.raw.destroyed) {
      reply.raw.write(textEncoder.encode(`data: [DONE]\n\n`));
    }

    reply.raw.end();
    return;
  });
};
