import dotenv from "dotenv";
import {
  FunctionOptions,
  GenerateJsonModel,
  LlamaCppTextGenerationModel,
  SchemaDefinition,
  TextGenerationModel,
  TextGenerationModelSettings,
  Tool,
  generateText,
  useTool,
} from "modelfusion";
import SecureJSON from "secure-json-parse";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { calculator } from "../../tool/calculator-tool";

dotenv.config();

// schema is specific to airoboros prompt
const airoborosFunctionSchema = z.object({
  function: z.string(),
  params: calculator.inputSchema,
});

// Prompt for Airoboros L2 13B GPT4 2.0:
// https://huggingface.co/TheBloke/airoboros-l2-13b-gpt4-2.0-GGML
class AiroborosFunctionPromptFormat<STRUCTURE> {
  readonly prefix = `{`;

  createPrompt({
    schemaDefinition,
    instruction,
  }: {
    schemaDefinition: SchemaDefinition<any, STRUCTURE>;
    instruction: string;
  }): string {
    // map schema definition
    // TODO add check for object instead of any
    const properties: Record<string, { type: string; description: string }> = (
      zodToJsonSchema(schemaDefinition.schema) as any
    ).properties;

    return [
      `As an AI assistant, please select the most suitable function and parameters ` +
        `from the list of available functions below, based on the user's input. ` +
        `Provide your response in JSON format.`,
      ``,
      `Available functions:`,
      `${schemaDefinition.name}:`,
      // TODO only include definition if defined:
      `  description: ${schemaDefinition.description ?? ""}`,
      `  params:`,
      // TODO support nested schemas
      ...Object.entries(properties).map(
        ([name, { type, description }]) =>
          `    ${name}: (${type}) ${description}`
      ),
      ``,
      `Input: ${instruction}`,
      ``,
      `Response: ${this.prefix}`,
    ].join("\n");
  }

  extractJson(response: string): unknown {
    const json = SecureJSON.parse(this.prefix + response);
    return airoborosFunctionSchema.parse(json).params;
  }
}

type JsonTextPromptFormat = {
  createPrompt: (prompt: {
    instruction: string;
    schemaDefinition: SchemaDefinition<any, unknown>;
  }) => string;
  extractJson: (response: string) => unknown;
};

type InstructionWithSchema<NAME extends string, STRUCTURE> = {
  instruction: string;
  schemaDefinition: SchemaDefinition<NAME, STRUCTURE>;
};

class JsonTextGenerationModel<
  SETTINGS extends TextGenerationModelSettings,
  MODEL extends TextGenerationModel<string, any, any, SETTINGS>,
> implements
    GenerateJsonModel<InstructionWithSchema<any, unknown>, string, SETTINGS>
{
  private readonly model: MODEL;
  private readonly format: JsonTextPromptFormat;

  constructor({
    model,
    format,
  }: {
    model: MODEL;
    format: JsonTextPromptFormat;
  }) {
    this.model = model;
    this.format = format;
  }

  get modelInformation() {
    return this.model.modelInformation;
  }

  get settings() {
    return this.model.settings;
  }

  async generateJsonResponse(
    prompt: InstructionWithSchema<any, unknown>,
    options?: FunctionOptions<SETTINGS> | undefined
  ): Promise<string> {
    return await generateText(
      this.model,
      this.format.createPrompt(prompt),
      options
    );
  }

  extractJson(response: string): unknown {
    return this.format.extractJson(response);
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new JsonTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
      format: this.format,
    }) as this;
  }
}

const InstructionWithSchemaPrompt = {
  forSchema<STRUCTURE>({
    instruction,
    schemaDefinition,
  }: {
    instruction: string;
    schemaDefinition: SchemaDefinition<any, STRUCTURE>;
  }) {
    return { schemaDefinition, instruction };
  },

  forTool<INPUT, OUTPUT>({
    instruction,
    tool,
  }: {
    instruction: string;
    tool: Tool<any, INPUT, OUTPUT>;
  }) {
    return InstructionWithSchemaPrompt.forSchema({
      instruction,
      schemaDefinition: tool.inputSchemaDefinition,
    });
  },

  forToolCurried<INPUT, OUTPUT>(instruction: string) {
    return (tool: Tool<any, INPUT, OUTPUT>) =>
      this.forTool({ instruction, tool });
  },
};

(async () => {
  const { tool, parameters, result } = await useTool(
    new JsonTextGenerationModel({
      model: new LlamaCppTextGenerationModel({
        nPredict: 1024,
        temperature: 0,
        contextWindowSize: 2048,
      }),
      format: new AiroborosFunctionPromptFormat(),
    }),
    calculator,
    InstructionWithSchemaPrompt.forToolCurried("What's fourteen times twelve?")
  );

  console.log(`Tool: ${tool}`);
  console.log(`Parameters: ${JSON.stringify(parameters)}`);
  console.log(`Result: ${result}`);
})();
