import z from "zod";

export const cohereTextGenerationResponseSchema = z.object({
  id: z.string(),
  generations: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ),
  prompt: z.string(),
  meta: z.object({
    api_version: z.object({
      version: z.string(),
    }),
  }),
});

export type CohereTextGenerationResponse = z.infer<
  typeof cohereTextGenerationResponseSchema
>;
