import cors from "@fastify/cors";
import {
  DefaultFlow,
  FileSystemAssetStorage,
  FileSystemLogger,
  modelFusionFlowPlugin,
} from "@modelfusion/server/fastify-plugin";
import dotenv from "dotenv";
import Fastify from "fastify";
import {
  ElevenLabsSpeechModel,
  OpenAIChatModel,
  setGlobalFunctionLogging,
  streamSpeech,
  streamText,
} from "modelfusion";
import path from "node:path";
import { z } from "zod";
import { eventSchema } from "../eventSchema";

dotenv.config();

setGlobalFunctionLogging("basic-text");

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const host = process.env.HOST;
const basePath = process.env.BASE_PATH || "runs";

export async function main() {
  try {
    const fastify = Fastify();

    await fastify.register(cors, {});

    const logger = new FileSystemLogger({
      path: (run) => path.join(basePath, run.runId, "logs"),
    });

    const assetStorage = new FileSystemAssetStorage({
      path: (run) => path.join(basePath, run.runId, "assets"),
      logger,
    });

    fastify.register(modelFusionFlowPlugin, {
      path: "/answer",
      logger,
      assetStorage,
      flow: new DefaultFlow({
        inputSchema: z.object({
          prompt: z.string(),
        }),
        eventSchema,
        async process({ input, run }) {
          const textStream = await streamText(
            new OpenAIChatModel({
              model: "gpt-4",
              temperature: 0.7,
              maxCompletionTokens: 50,
            }).withInstructionPrompt(),
            { instruction: input.prompt }
          );

          const speechStream = await streamSpeech(
            new ElevenLabsSpeechModel({
              voice: "pNInz6obpgDQGcFmaJgB", // Adam
              optimizeStreamingLatency: 1,
              voiceSettings: {
                stability: 1,
                similarityBoost: 0.35,
              },
              generationConfig: {
                chunkLengthSchedule: [50, 90, 120, 150, 200],
              },
            }),
            textStream
          );

          // Run in parallel:
          await Promise.allSettled([
            // stream text to client:
            (async () => {
              for await (const textPart of textStream) {
                run.publishEvent({ type: "text-chunk", delta: textPart });
              }
            })(),

            // stream tts audio to client:
            (async () => {
              for await (const speechPart of speechStream) {
                run.publishEvent({
                  type: "speech-chunk",
                  base64Audio: speechPart.toString("base64"),
                });
              }
            })(),
          ]);

          run.publishEvent({ type: "finished" });
        },
      }),
    });

    console.log(`Starting server on port ${port}...`);
    await fastify.listen({ port, host });
    console.log("Server started");
  } catch (error) {
    console.error("Failed to start server");
    console.error(error);
    process.exit(1);
  }
}

main();
