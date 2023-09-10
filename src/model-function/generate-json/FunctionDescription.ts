import { Schema } from "./Schema.js";

export interface FunctionDescription<NAME extends string, STRUCTURE> {
  name: NAME;
  description?: string;
  parameters: Schema<STRUCTURE>;
}
