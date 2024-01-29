import {
  ObjectGenerationModel,
  ObjectGenerationModelSettings,
} from "../model-function/generate-object/ObjectGenerationModel";
import { Tool } from "./Tool";
import { JsonSchemaProducer } from "../core/schema/JsonSchemaProducer";
import { PromptFunction } from "../core/PromptFunction";
import { Schema } from "../core/schema/Schema";
import { generateObject } from "../model-function/generate-object/generateObject";

/**
 * A tool that generates an object. You can configure it with a model, an input, an output schema, and a prompt.
 */
export class ObjectGeneratorTool<
  NAME extends string,
  PROMPT,
  PARAMETERS,
  OBJECT,
> extends Tool<NAME, PARAMETERS, OBJECT> {
  constructor({
    name = "object-generator" as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    description,
    model,
    parameters,
    objectSchema,
    prompt,
  }: {
    name?: NAME;
    description?: string;
    model: ObjectGenerationModel<PROMPT, ObjectGenerationModelSettings>;
    parameters: Schema<PARAMETERS> & JsonSchemaProducer;
    objectSchema: Schema<OBJECT> & JsonSchemaProducer;
    prompt: (input: PARAMETERS) => PromptFunction<PARAMETERS, PROMPT>;
  }) {
    super({
      name,
      description,
      parameters,
      execute: async (input, options) =>
        generateObject({
          model,
          schema: objectSchema,
          prompt: prompt(input),
          ...options,
        }),
    });
  }
}
