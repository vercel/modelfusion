import zod from "zod";

export const cohereTextGenerationResponseSchema = zod.object({
  id: zod.string(),
  generations: zod.array(
    zod.object({
      id: zod.string(),
      text: zod.string(),
    })
  ),
  prompt: zod.string(),
  meta: zod.object({
    api_version: zod.object({
      version: zod.string(),
    }),
  }),
});

export type CohereTextGenerationResponse = zod.infer<
  typeof cohereTextGenerationResponseSchema
>;
