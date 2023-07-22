import { z } from "zod";

export type SchemaDefinition<NAME extends string, STRUCTURE> = {
  name: NAME;
  description?: string;
  schema: z.Schema<STRUCTURE>;
};
