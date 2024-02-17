import z from "zod";
/**
 * @see https://openai.com/pricing
 */
export const OPENAI_TRANSCRIPTION_MODELS = {
  "whisper-1": {
    costInMillicentsPerSecond: 10, // = 600 / 60,
  },
};

export type OpenAITranscriptionModelType =
  keyof typeof OPENAI_TRANSCRIPTION_MODELS;

export const openAITranscriptionVerboseJsonSchema = z.object({
  task: z.literal("transcribe"),
  language: z.string(),
  duration: z.number(),
  segments: z.array(
    z.object({
      id: z.number(),
      seek: z.number(),
      start: z.number(),
      end: z.number(),
      text: z.string(),
      tokens: z.array(z.number()),
      temperature: z.number(),
      avg_logprob: z.number(),
      compression_ratio: z.number(),
      no_speech_prob: z.number(),
      transient: z.boolean().optional(),
    })
  ),
  text: z.string(),
});

export type OpenAITranscriptionVerboseJsonResponse = z.infer<
  typeof openAITranscriptionVerboseJsonSchema
>;
