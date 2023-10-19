import * as dotenv from "dotenv";
import {
  AsyncQueue,
  ElevenLabsSpeechSynthesisModel,
  OpenAITextGenerationModel,
  setGlobalFunctionLogging,
  streamText,
  synthesizeSpeech,
} from "modelfusion";
import { runEndpointServer } from "./runEndpointServer";
import { z } from "zod";
import { eventSchema } from "../endpoint/eventSchema";

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
        new OpenAITextGenerationModel({
          model: "gpt-3.5-turbo-instruct",
          temperature: 0.7,
          maxCompletionTokens: 50,
        }),
        input.prompt
      );

      const speechStreamInput = new AsyncQueue<string>();

      const speechStream = await synthesizeSpeech(
        new ElevenLabsSpeechSynthesisModel({
          voice: "pNInz6obpgDQGcFmaJgB", // Adam
          voiceSettings: {
            stability: 1,
            similarityBoost: 0.35,
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
