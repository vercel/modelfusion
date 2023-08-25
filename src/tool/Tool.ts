import { z } from "zod";
import { SchemaDefinition } from "../model-function/generate-json/SchemaDefinition.js";
import { FunctionOptions } from "../run/FunctionOptions.js";
import { InvalidToolNameError } from "./InvalidToolNameError.js";

const namePattern = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * A tool is a function with a name, description and defined inputs that can be used
 * by agents and chatbots.
 */
export class Tool<NAME extends string, INPUT, OUTPUT> {
  /**
   * The name of the tool.
   * It has to be a function name that matches the regular expression pattern '^[a-zA-Z0-9_-]{1,64}$'.
   * Should be understandable for language models and unique among the tools that they know.
   */
  readonly name: NAME;

  /**
   * A description of what the tool does. Will be used by the language model to decide whether to use the tool.
   */
  readonly description: string;

  /**
   * The schema of the input that the tool expects. The language model will use this to generate the input.
   * Use descriptions to make the input understandable for the language model.
   */
  readonly inputSchema: z.ZodSchema<INPUT>;

  /**
   * An optional schema of the output that the tool produces. This will be used to validate the output.
   */
  readonly outputSchema?: z.ZodSchema<OUTPUT>;

  /**
   * The actual execution function of the tool.
   */
  readonly execute: (
    input: INPUT,
    options?: FunctionOptions
  ) => PromiseLike<OUTPUT>;

  constructor({
    name,
    description,
    inputSchema,
    outputSchema,
    execute,
  }: {
    name: NAME;
    description: string;
    inputSchema: z.ZodSchema<INPUT>;
    outputSchema?: z.ZodSchema<OUTPUT>;
    execute(input: INPUT, options?: FunctionOptions): PromiseLike<OUTPUT>;
  }) {
    // check that the name is a valid function name:
    if (!namePattern.test(name)) {
      throw new InvalidToolNameError({
        toolName: name,
        namePattern,
      });
    }

    this.name = name;
    this.description = description;
    this.inputSchema = inputSchema;
    this.outputSchema = outputSchema;
    this.execute = execute;
  }

  /**
   * Provdes a schema definition with the name, description and schema of the input.
   * This is used by `useTool`.
   */
  get inputSchemaDefinition(): SchemaDefinition<NAME, INPUT> {
    return {
      name: this.name,
      description: this.description,
      schema: this.inputSchema,
    };
  }
}
