import { JsonSchemaProducer } from "./JsonSchemaProducer.js";
import { Schema } from "./Schema.js";

export interface StructureDefinition<NAME extends string, STRUCTURE> {
  name: NAME;
  description?: string;
  schema: Schema<STRUCTURE> & JsonSchemaProducer;
}
