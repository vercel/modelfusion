import { JsonSchemaProducer } from "../../core/schema/JsonSchemaProducer.js";
import { Schema } from "../../core/schema/Schema.js";

export interface ToolCallDefinition<NAME extends string, PARAMETERS> {
  name: NAME;
  description?: string;
  parameters: Schema<PARAMETERS> & JsonSchemaProducer;
}
