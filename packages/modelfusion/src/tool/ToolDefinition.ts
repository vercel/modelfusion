import { JsonSchemaProducer } from "../core/schema/JsonSchemaProducer";
import { Schema } from "../core/schema/Schema";

export interface ToolDefinition<NAME extends string, PARAMETERS> {
  name: NAME;
  description?: string;
  parameters: Schema<PARAMETERS> & JsonSchemaProducer;
}
