import {
  ElevenLabsSpeechModel,
  OpenAIChatModel,
  streamSpeech,
  streamText,
} from "modelfusion";
import { DefaultFlow } from "modelfusion/fastify-server";
import { z } from "zod";

export const duplexStreamingFlowSchema = {
  input: z.object({
    prompt: z.string(),
  }),
  events: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("text-chunk"),
      delta: z.string(),
    }),
    z.object({
      type: z.literal("speech-chunk"),
      base64Audio: z.string(),
    }),
  ]),
};

export const duplexStreamingFlow = new DefaultFlow({
  schema: duplexStreamingFlowSchema,
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
      (async () => {
        // stream text to client:
        for await (const textPart of textStream) {
          run.publishEvent({ type: "text-chunk", delta: textPart });
        }
      })(),

      (async () => {
        // stream tts audio to client:
        for await (const speechPart of speechStream) {
          run.publishEvent({
            type: "speech-chunk",
            base64Audio: speechPart.toString("base64"),
          });
        }
      })(),
    ]);
  },
});
