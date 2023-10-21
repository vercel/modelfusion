import cors from "@fastify/cors";
import * as dotenv from "dotenv";
import Fastify from "fastify";
import {
  AsyncQueue,
  DefaultRun,
  ElevenLabsSpeechModel,
  OpenAIChatModel,
  setGlobalFunctionLogging,
  streamText,
  generateSpeech,
  withRun,
} from "modelfusion";
import { z } from "zod";
import { eventSchema } from "../eventSchema";

dotenv.config();

setGlobalFunctionLogging("basic-text");

const inputSchema = z.object({
  prompt: z.string(),
});

export async function runEndpointServer({
  host = "0.0.0.0",
  port = 3001,
}: {
  host?: string;
  port?: number;
}) {
  const server = Fastify();

  await server.register(cors, {});

  server.post(`/answer`, async (request, reply) => {
    const events = new AsyncQueue<z.infer<typeof eventSchema>>();

    const input = inputSchema.parse(request.body);

    const run = new DefaultRun();

    // start longer-running process (no await):
    withRun(run, async () => {
      const textStream = await streamText(
        new OpenAIChatModel({
          model: "gpt-4",
          temperature: 0.7,
          maxCompletionTokens: 50,
        }).withInstructionPrompt(),
        { instruction: input.prompt }
      );

      const speechStreamInput = new AsyncQueue<string>();

      const speechStream = await generateSpeech(
        new ElevenLabsSpeechModel({
          voice: "pNInz6obpgDQGcFmaJgB", // Adam
          model: "eleven_monolingual_v1",
          voiceSettings: {
            stability: 1,
            similarityBoost: 0.35,
          },
          generationConfig: {
            chunkLengthSchedule: [50, 90, 120, 150, 200],
          },
        }),
        speechStreamInput,
        { mode: "stream-duplex" }
      );

      // Run in parallel:
      await Promise.all([
        // stream text to client and to tts model:
        (async () => {
          try {
            for await (const textFragment of textStream) {
              speechStreamInput.push(textFragment);
              events.push({ type: "text-chunk", delta: textFragment });
            }
          } finally {
            speechStreamInput.close();
          }
        })(),

        // stream tts audio to client:
        (async () => {
          for await (const speechFragment of speechStream) {
            events.push({
              type: "speech-chunk",
              base64Audio: speechFragment.toString("base64"),
            });
          }
        })(),
      ]);

      events.close();
    });

    // return event stream to client:
    reply.raw.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Content-Encoding": "none",
    });

    const textEncoder = new TextEncoder();
    for await (const event of events) {
      if (reply.raw.destroyed) {
        break;
      }
      reply.raw.write(textEncoder.encode(`data: ${JSON.stringify(event)}\n\n`));
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

runEndpointServer({
  port: +(process.env.PORT ?? "3001"),
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
