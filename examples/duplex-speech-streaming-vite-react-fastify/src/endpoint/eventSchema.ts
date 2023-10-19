import { z } from "zod";

export const eventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text-chunk"),
    delta: z.string(),
  }),
  z.object({
    type: z.literal("tts-chunk"),
    base64Audio: z.string(),
  }),
  z.object({
    type: z.literal("finish"),
  }),
]);
