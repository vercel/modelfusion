import {
  AsyncQueue,
  ElevenLabsSpeechSynthesisModel,
  OpenAIChatModel,
  streamText,
  synthesizeSpeech,
} from "modelfusion";
import { z } from "zod";
import { eventSchema } from "../endpoint/eventSchema";
import { Endpoint } from "../server/Endpoint";

const inputSchema = z.object({
  prompt: z.string(),
});

export const answerEndpoint: Endpoint<
  z.infer<typeof inputSchema>,
  z.infer<typeof eventSchema>
> = {
  name: "answer",
  inputSchema,
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
};
