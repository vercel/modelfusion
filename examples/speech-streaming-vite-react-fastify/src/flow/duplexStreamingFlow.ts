import { elevenlabs, openai, streamSpeech, streamText } from "modelfusion";
import { duplexStreamingFlowSchema } from "./duplexStreamingFlowSchema";
import { DefaultFlow } from "modelfusion-experimental/fastify-server";

export const duplexStreamingFlow = new DefaultFlow({
  schema: duplexStreamingFlowSchema,
  async process({ input, run }) {
    const textStream = await streamText(
      openai
        .ChatTextGenerator({
          model: "gpt-4",
          temperature: 0.7,
          maxGenerationTokens: 1000,
        })
        .withInstructionPrompt(),
      { instruction: input.prompt }
    );

    const speechStream = await streamSpeech(
      elevenlabs.SpeechGenerator({
        model: "eleven_turbo_v2",
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
