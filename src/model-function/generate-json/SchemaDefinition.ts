import { Schema } from "./Schema.js";

export type SchemaDefinition<NAME extends string, STRUCTURE> = {
  name: NAME;
  description?: string;
  schema: Schema<STRUCTURE>;
};
