import * as dotenv from "dotenv";
import {
  AsyncQueue,
  ElevenLabsSpeechSynthesisModel,
  OpenAIChatModel,
  setGlobalFunctionLogging,
  streamText,
  synthesizeSpeech,
} from "modelfusion";
import { z } from "zod";
import { eventSchema } from "../endpoint/eventSchema";
import { runEndpointServer } from "./runEndpointServer";

dotenv.config();

setGlobalFunctionLogging("basic-text");

runEndpointServer({
  port: +(process.env.PORT ?? "3001"),
  endpoint: {
    name: "answer",

    inputSchema: z.object({
      prompt: z.string(),
    }),

    eventSchema,

    async processRequest({ input, run }) {
      const textStream = await streamText(
        new OpenAIChatModel({
          model: "gpt-4",
          temperature: 0.7,
          maxCompletionTokens: 50,
        }).withInstructionPrompt(),
        { instruction: input.prompt }
      );

      const speechStreamInput = new AsyncQueue<string>();

      const speechStream = await synthesizeSpeech(
        new ElevenLabsSpeechSynthesisModel({
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
              run.publishEvent({ type: "text-chunk", delta: textFragment });
            }
          } finally {
            speechStreamInput.close();
          }
        })(),

        // stream tts audio to client:
        (async () => {
          for await (const speechFragment of speechStream) {
            run.publishEvent({
              type: "speech-chunk",
              base64Audio: speechFragment.toString("base64"),
            });
          }
        })(),
      ]);

      run.publishEvent({ type: "finish" });
    },
  },
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
