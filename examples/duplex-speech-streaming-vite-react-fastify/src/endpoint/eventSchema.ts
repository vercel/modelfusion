import { z } from "zod";

export const eventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("start-llm"),
  }),
  z.object({
    type: z.literal("start-tts"),
  }),
  z.object({
    type: z.literal("tts-chunk"),
    base64Audio: z.string(),
  }),
  z.object({
    type: z.literal("finish-tts"),
  }),
]);
