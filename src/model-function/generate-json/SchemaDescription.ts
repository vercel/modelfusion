import { Schema } from "./Schema.js";

export interface SchemaDescription<NAME extends string, STRUCTURE> {
  name: NAME;
  description?: string;
  schema: Schema<STRUCTURE>;
}
