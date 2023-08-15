import dotenv from "dotenv";
import {
  FunctionOptions,
  GenerateJsonModel,
  GenerateJsonPrompt,
  LlamaCppTextGenerationModel,
  SchemaDefinition,
  TextGenerationModel,
  TextGenerationModelSettings,
  Tool,
  generateJson,
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
class AiroborosFunctionPrompt<STRUCTURE> implements GenerateJsonPrompt<string> {
  readonly prefix = `{`;
  readonly schemaDefinition: SchemaDefinition<any, STRUCTURE>;
  readonly instruction: string;

  constructor({
    schemaDefinition,
    instruction,
  }: {
    schemaDefinition: SchemaDefinition<any, STRUCTURE>;
    instruction: string;
  }) {
    this.schemaDefinition = schemaDefinition;
    this.instruction = instruction;
  }

  create(): string {
    // map schema definition
    // TODO add check for object instead of any
    const properties: Record<string, { type: string; description: string }> = (
      zodToJsonSchema(this.schemaDefinition.schema) as any
    ).properties;

    return [
      `As an AI assistant, please select the most suitable function and parameters ` +
        `from the list of available functions below, based on the user's input. ` +
        `Provide your response in JSON format.`,
      ``,
      `Available functions:`,
      `${this.schemaDefinition.name}:`,
      // TODO only include definition if defined:
      `  description: ${this.schemaDefinition.description ?? ""}`,
      `  params:`,
      // TODO support nested schemas
      ...Object.entries(properties).map(
        ([name, { type, description }]) =>
          `    ${name}: (${type}) ${description}`
      ),
      ``,
      `Input: ${this.instruction}`,
      ``,
      `Response: ${this.prefix}`,
    ].join("\n");
  }

  extractJson(response: string): unknown {
    const json = SecureJSON.parse(this.prefix + response);
    return airoborosFunctionSchema.parse(json).params;
  }
}

class OutputParsingTextGenerationModel<
  SETTINGS extends TextGenerationModelSettings,
  MODEL extends TextGenerationModel<string, any, any, SETTINGS>,
> implements
    GenerateJsonModel<AiroborosFunctionPrompt<unknown>, string, SETTINGS>
{
  private readonly model: MODEL;

  constructor({ model }: { model: MODEL }) {
    this.model = model;
  }

  get modelInformation() {
    return this.model.modelInformation;
  }

  get settings() {
    return this.model.settings;
  }

  async generateJsonResponse(
    prompt: AiroborosFunctionPrompt<unknown>,
    options?: FunctionOptions<SETTINGS> | undefined
  ): Promise<string> {
    return await generateText(this.model, prompt.create(), options);
  }

  withSettings(additionalSettings: Partial<SETTINGS>): this {
    return new OutputParsingTextGenerationModel({
      model: this.model.withSettings(additionalSettings),
    }) as this;
  }
}

const OutputParsingFunctionPrompt = {
  forSchema<STRUCTURE>({
    instruction,
    schemaDefinition,
  }: {
    instruction: string;
    schemaDefinition: SchemaDefinition<any, STRUCTURE>;
  }) {
    return new AiroborosFunctionPrompt({
      schemaDefinition,
      instruction,
    });
  },

  forTool<INPUT, OUTPUT>({
    instruction,
    tool,
  }: {
    instruction: string;
    tool: Tool<any, INPUT, OUTPUT>;
  }) {
    return OutputParsingFunctionPrompt.forSchema({
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
    new OutputParsingTextGenerationModel({
      model: new LlamaCppTextGenerationModel({
        nPredict: 1024,
        temperature: 0,
        contextWindowSize: 2048,
      }),
    }),
    calculator,
    // TODO inject Airoboros
    OutputParsingFunctionPrompt.forToolCurried("What's fourteen times twelve?")
  );

  console.log(`Tool: ${tool}`);
  console.log(`Parameters: ${JSON.stringify(parameters)}`);
  console.log(`Result: ${result}`);
})();
